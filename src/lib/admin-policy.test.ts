import { describe, expect, it } from "vitest";
import {
  ADMIN_IDLE_MS,
  ADMIN_ABSOLUTE_MS,
  MAX_LOGIN_FAILURES,
  sessionExpired,
  hasPermission,
  originAllowed,
} from "./admin-policy";
describe("Admin security rules", () => {
  it("expires at two hours idle", () => {
    expect(ADMIN_IDLE_MS).toBe(7200000);
    expect(sessionExpired(0, 1000, 7201000)).toBe(true);
    expect(sessionExpired(0, 1000, 7200999)).toBe(false);
  });
  it("expires at twelve hours absolute", () => {
    expect(ADMIN_ABSOLUTE_MS).toBe(43200000);
    expect(sessionExpired(0, 43200000, 43200000)).toBe(true);
  });
  it("locks after five failures", () => {
    expect(MAX_LOGIN_FAILURES).toBe(5);
  });
  it("owner has every permission", () => {
    for (const r of ["products", "moods", "orders", "users", "settings", "audit"] as const)
      expect(hasPermission("owner", r)).toBe(true);
  });
  it("manager may manage products moods orders but not users or settings", () => {
    expect(hasPermission("manager", "products")).toBe(true);
    expect(hasPermission("manager", "moods")).toBe(true);
    expect(hasPermission("manager", "orders")).toBe(true);
    expect(hasPermission("manager", "users")).toBe(false);
    expect(hasPermission("manager", "settings")).toBe(false);
  });
  it("staff only manages orders", () => {
    expect(hasPermission("staff", "orders")).toBe(true);
    expect(hasPermission("staff", "products")).toBe(false);
    expect(hasPermission("staff", "users")).toBe(false);
  });
  it("rejects cross-site and missing origins", () => {
    expect(originAllowed("https://evil.example", "https://store.example/admin")).toBe(false);
    expect(originAllowed(null, "https://store.example/admin")).toBe(false);
    expect(originAllowed("https://store.example", "https://store.example/admin")).toBe(true);
  });
});
