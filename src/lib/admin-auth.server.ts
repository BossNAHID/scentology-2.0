import { createClient } from "@supabase/supabase-js";
import {
  getRequest,
  getRequestIP,
  useSession,
  setResponseHeader,
} from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";
import { originAllowed, sessionExpired, type AdminRole } from "./admin-policy";

type AuthCookie = {
  access?: string;
  refresh?: string;
  userId?: string;
  sessionId?: string;
  created?: number;
  seen?: number;
  factorId?: string;
};
export function assertOrigin() {
  const request = getRequest();
  if (!originAllowed(request.headers.get("origin"), request.url))
    throw new Error("Request not permitted.");
}
export async function authCookie() {
  const password = process.env["SESSION_SECRET"];
  if (!password) throw new Error("Secure sign-in is not configured.");
  setResponseHeader("cache-control", "no-store");
  return useSession<AuthCookie>({
    password,
    name: "__Host-scentology-admin",
    maxAge: 43200,
    cookie: { httpOnly: true, secure: true, sameSite: "strict", path: "/" },
  });
}
export function authClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Secure sign-in is not configured.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
export async function digest(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), (n) => n.toString(16).padStart(2, "0")).join("");
}
export async function loginBudget(email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const account = await digest(`account:${email.toLowerCase()}`);
  const ip = await digest(`ip:${getRequestIP() ?? "unknown"}`);
  const a = await supabaseAdmin.rpc("reserve_login_attempt", { p_key: account });
  const b = await supabaseAdmin.rpc("reserve_login_attempt", { p_key: ip });
  if (a.error || b.error || !a.data || !b.data) return null;
  return { account, ip };
}
export async function restoreAuth() {
  const cookie = await authCookie();
  const { access, refresh, created, seen } = cookie.data;
  if (
    !access ||
    !refresh ||
    created === undefined ||
    seen === undefined ||
    sessionExpired(created, seen, Date.now())
  ) {
    await cookie.clear();
    throw new Error("Please sign in again.");
  }
  const client = authClient();
  const { data, error } = await client.auth.setSession({
    access_token: access,
    refresh_token: refresh,
  });
  if (error || !data.session) {
    await cookie.clear();
    throw new Error("Please sign in again.");
  }
  const userResult = await client.auth.getUser();
  if (userResult.error || !userResult.data.user || userResult.data.user.id !== cookie.data.userId) {
    await cookie.clear();
    throw new Error("Please sign in again.");
  }
  await cookie.update({ access: data.session.access_token, refresh: data.session.refresh_token });
  return { client, cookie, user: userResult.data.user };
}
export async function requireAdmin() {
  const state = await restoreAuth();
  const level = await state.client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level.error || level.data?.currentLevel !== "aal2" || !state.cookie.data.sessionId)
    throw new Error("Two-factor verification required.");
  const roles = await state.client.from("user_roles").select("role").eq("user_id", state.user.id);
  const role = roles.data?.find((r) => r.role === "owner")?.role ?? roles.data?.[0]?.role;
  if (roles.error || !role) throw new Error("Access not permitted.");
  // Privileged session storage is accessed only after validated identity, MFA and role checks.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const record = await supabaseAdmin
    .from("admin_sessions")
    .select("*")
    .eq("id", state.cookie.data.sessionId)
    .eq("user_id", state.user.id)
    .is("revoked_at", null)
    .single();
  if (
    record.error ||
    !record.data ||
    sessionExpired(
      Date.parse(record.data.created_at),
      Date.parse(record.data.last_seen_at),
      Date.now(),
    )
  ) {
    await state.cookie.clear();
    throw new Error("Please sign in again.");
  }
  const updated = await supabaseAdmin
    .from("admin_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", record.data.id);
  if (updated.error) throw new Error("Unable to verify session.");
  await state.cookie.update({ seen: Date.now() });
  return { ...state, role: role as AdminRole, supabaseAdmin };
}
