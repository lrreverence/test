import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { z } from "zod";
import { env } from "./config/env.js";
import { hasNutritionAccess } from "./domain/user.js";
import { prismaUserRepository, type UserRepository } from "./repositories/user.repository.js";
import { createStripeBillingService, type BillingService } from "./services/billing.service.js";
import { locales, searchOpenFoodFacts, type Locale, type Product } from "./services/products.service.js";

type Dependencies = {
  repository: UserRepository;
  billing: BillingService;
  searchProducts: (query: string, locale: Locale, includeNutrition: boolean) => Promise<Product[]>;
};

const searchSchema = z.object({
  query: z.string().trim().min(2).max(100),
  locale: z.enum(locales).default("en")
});

export function createApp(overrides: Partial<Dependencies> = {}) {
  const repository = overrides.repository ?? prismaUserRepository;
  const billing = overrides.billing ?? createStripeBillingService(repository);
  const searchProducts = overrides.searchProducts ?? searchOpenFoodFacts;
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.WEB_URL }));

  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (request, response, next) => {
    try {
      const signature = request.header("stripe-signature");
      if (!signature) return response.status(400).json({ error: "Missing Stripe signature" });
      const result = await billing.processWebhook(request.body as Buffer, signature);
      return response.json({ received: true, ...result });
    } catch (error) {
      return next(error);
    }
  });

  app.use(express.json({ limit: "100kb" }));
  app.get("/health", (_request, response) => response.json({ status: "ok" }));

  app.get("/api/user", async (_request, response, next) => {
    try {
      const user = await repository.getDemoUser();
      response.json({
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        hasNutritionAccess: hasNutritionAccess(user),
        canManageBilling: Boolean(user.stripeCustomerId)
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/searches/recent", async (_request, response, next) => {
    try {
      response.json({ searches: await repository.getRecentSearches() });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/search", async (request, response, next) => {
    try {
      const input = searchSchema.parse(request.query);
      const user = await repository.getDemoUser();
      const includeNutrition = hasNutritionAccess(user);
      const products = await searchProducts(input.query, input.locale, includeNutrition);
      await repository.recordSearch(input.query, input.locale);
      response.json({ products, nutritionLocked: !includeNutrition });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/billing/checkout", async (_request, response, next) => {
    try {
      response.json({ url: await billing.createCheckout() });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/billing/portal", async (_request, response, next) => {
    try {
      response.json({ url: await billing.createPortal() });
    } catch (error) {
      next(error);
    }
  });

  app.use((_request, response) => response.status(404).json({ error: "Not found" }));

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof z.ZodError) {
      response.status(400).json({ error: "Invalid request", details: error.issues });
      return;
    }
    console.error(error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    const publicMessage = env.NODE_ENV === "production" ? "The request could not be completed" : message;
    response.status(500).json({ error: publicMessage });
  };
  app.use(errorHandler);

  return app;
}

