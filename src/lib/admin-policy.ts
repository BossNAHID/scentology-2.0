export const ADMIN_IDLE_MS = 2 * 60 * 60 * 1000;
export const ADMIN_ABSOLUTE_MS = 12 * 60 * 60 * 1000;
export const MAX_LOGIN_FAILURES = 5;
export type AdminRole = "owner" | "manager" | "staff";
export function sessionExpired(created: number, lastSeen: number, now: number) {
  return now - created >= ADMIN_ABSOLUTE_MS || now - lastSeen >= ADMIN_IDLE_MS;
}
export function hasPermission(
  role: AdminRole,
  resource: "products" | "moods" | "orders" | "users" | "settings" | "audit",
) {
  if (role === "owner") return true;
  if (role === "manager") return ["products", "moods", "orders"].includes(resource);
  return resource === "orders";
}
export function originAllowed(origin: string | null, requestUrl: string) {
  return origin !== null && origin === new URL(requestUrl).origin;
}
