import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import type { UserRepository } from "../src/repositories/user.repository.js";
import type { BillingService } from "../src/services/billing.service.js";

const user = {
  id: "demo-user",
  email: "demo@labelwise.test",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: "inactive",
  currentPeriodEnd: null
};

function dependencies() {
  const repository: UserRepository = {
    getDemoUser: vi.fn().mockResolvedValue(user),
    recordSearch: vi.fn().mockResolvedValue(undefined),
    getRecentSearches: vi.fn().mockResolvedValue([]),
    setStripeCustomer: vi.fn(),
    updateSubscription: vi.fn(),
    hasStripeEvent: vi.fn().mockResolvedValue(false),
    recordStripeEvent: vi.fn()
  };
  const billing: BillingService = {
    createCheckout: vi.fn().mockResolvedValue("https://checkout.stripe.test/session"),
    createPortal: vi.fn().mockResolvedValue("https://billing.stripe.test/session"),
    processWebhook: vi.fn().mockResolvedValue({ duplicate: false })
  };
  return { repository, billing };
}

describe("API", () => {
  it("rejects unsupported locales before calling the provider", async () => {
    const deps = dependencies();
    const searchProducts = vi.fn();
    const response = await request(createApp({ ...deps, searchProducts })).get("/api/products/search?query=milk&locale=es");
    expect(response.status).toBe(400);
    expect(searchProducts).not.toHaveBeenCalled();
  });

  it("enforces the free-user nutrition policy and stores the search", async () => {
    const deps = dependencies();
    const searchProducts = vi.fn().mockResolvedValue([{ code: "1", nutrition: null }]);
    const response = await request(createApp({ ...deps, searchProducts })).get("/api/products/search?query=oats&locale=en");
    expect(response.status).toBe(200);
    expect(response.body.nutritionLocked).toBe(true);
    expect(searchProducts).toHaveBeenCalledWith("oats", "en", false);
    expect(deps.repository.recordSearch).toHaveBeenCalledWith("oats", "en");
  });

  it("requires Stripe's webhook signature", async () => {
    const response = await request(createApp(dependencies())).post("/api/webhooks/stripe").send("{}");
    expect(response.status).toBe(400);
  });
});

