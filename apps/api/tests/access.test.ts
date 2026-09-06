import { describe, expect, it, vi } from "vitest";
import { hasNutritionAccess } from "../src/domain/user.js";

describe("nutrition access policy", () => {
  const future = new Date("2030-01-01T00:00:00Z");
  const past = new Date("2020-01-01T00:00:00Z");
  const now = new Date("2025-01-01T00:00:00Z");

  it.each(["active", "trialing"])("allows %s subscriptions", (subscriptionStatus) => {
    expect(hasNutritionAccess({ subscriptionStatus, currentPeriodEnd: future }, now)).toBe(true);
  });

  it.each(["inactive", "past_due", "canceled"])("rejects %s subscriptions", (subscriptionStatus) => {
    expect(hasNutritionAccess({ subscriptionStatus, currentPeriodEnd: future }, now)).toBe(false);
  });

  it("rejects expired subscriptions even if the stored status is active", () => {
    expect(hasNutritionAccess({ subscriptionStatus: "active", currentPeriodEnd: past }, now)).toBe(false);
  });
});

