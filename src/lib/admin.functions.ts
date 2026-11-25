import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hasPermission } from "./admin-policy";
import {
  assertOrigin,
  authCookie,
  authClient,
  loginBudget,
  restoreAuth,
  requireAdmin,
} from "./admin-auth.server";

export const adminSignIn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    assertOrigin();
    const budget = await loginBudget(data.email);
    if (!budget)
      return { ok: false as const, error: "Invalid email or password. Please try again later." };
    const client = authClient();
    const result = await client.auth.signInWithPassword(data);
    if (result.error || !result.data.session)
      return { ok: false as const, error: "Invalid email or password." };
    const roles = await client.from("user_roles").select("role").eq("user_id", result.data.user.id);
    if (roles.error || !roles.data?.length) {
      await client.auth.signOut();
      return { ok: false as const, error: "Invalid email or password." };
    }
    const cookie = await authCookie();
    await cookie.clear();
    await cookie.update({
      access: result.data.session.access_token,
      refresh: result.data.session.refresh_token,
      userId: result.data.user.id,
      created: Date.now(),
      seen: Date.now(),
    });
    const factors = await client.auth.mfa.listFactors();
    if (factors.error) {
      await cookie.clear();
      return { ok: false as const, error: "Unable to start two-factor verification." };
    }
    const factor = factors.data.totp.find((f) => f.status === "verified");
    if (factor) {
      await cookie.update({ factorId: factor.id });
      return { ok: true as const, step: "verify" as const, qr: "" };
    }
    // Remove only unfinished enrollments; never remove a verified factor.
    for (const f of factors.data.all.filter((f) => f.status === "unverified"))
      await client.auth.mfa.unenroll({ factorId: f.id });
    const enrollment = await client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Scentology BD admin",
      issuer: "Scentology BD",
    });
    if (enrollment.error) {
      await cookie.clear();
      return { ok: false as const, error: "Unable to set up two-factor verification." };
    }
    await cookie.update({ factorId: enrollment.data.id });
    return { ok: true as const, step: "enroll" as const, qr: enrollment.data.totp.qr_code };
  });
export const verifyAdminCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ code: z.string().regex(/^\d{6}$/) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    assertOrigin();
    const { client, cookie, user } = await restoreAuth();
    const budget = await loginBudget(`mfa:${user.id}`);
    if (!budget || !cookie.data.factorId)
      return { ok: false as const, error: "Verification unavailable. Please sign in again later." };
    const verified = await client.auth.mfa.challengeAndVerify({
      factorId: cookie.data.factorId,
      code: data.code,
    });
    if (verified.error) return { ok: false as const, error: "Invalid verification code." };
    await client.auth.setSession({
      access_token: verified.data.access_token,
      refresh_token: verified.data.refresh_token,
    });
    const roles = await client.from("user_roles").select("role").eq("user_id", user.id);
    if (roles.error || !roles.data?.length) {
      await cookie.clear();
      return { ok: false as const, error: "Access not permitted." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const session = await supabaseAdmin
      .from("admin_sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    if (session.error || !session.data) throw new Error("Unable to create session.");
    await cookie.clear();
    await cookie.update({
      userId: user.id,
      access: verified.data.access_token,
      refresh: verified.data.refresh_token,
      created: Date.now(),
      seen: Date.now(),
      sessionId: session.data.id,
    });
    await supabaseAdmin.from("audit_log").insert({
      user_id: user.id,
      action: "admin.login",
      entity: "session",
      entity_id: session.data.id,
    });
    return { ok: true as const, error: "" };
  });
export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const state = await requireAdmin();
    const products = hasPermission(state.role, "products")
      ? await state.supabaseAdmin.from("products").select("id", { count: "exact", head: true })
      : { count: 0 };
    return {
      signedIn: true as const,
      email: state.user.email ?? "",
      role: state.role,
      products: products.count ?? 0,
    };
  } catch {
    return { signedIn: false as const, email: "", role: "", products: 0 };
  }
});
export const adminSignOut = createServerFn({ method: "POST" }).handler(async () => {
  assertOrigin();
  try {
    const state = await requireAdmin();
    await state.supabaseAdmin
      .from("admin_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", state.cookie.data.sessionId ?? "")
      .eq("user_id", state.user.id);
    await state.client.auth.signOut();
  } catch {
    /* Always remove the browser's encrypted session, including expired sessions. */
  }
  const cookie = await authCookie();
  await cookie.clear();
  return { ok: true };
});
