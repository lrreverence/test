import Stripe from "stripe";
import { env } from "../config/env.js";
import { DEMO_USER } from "../domain/user.js";
import type { UserRepository } from "../repositories/user.repository.js";

export interface BillingService {
  createCheckout(): Promise<string>;
  createPortal(): Promise<string>;
  processWebhook(payload: Buffer, signature: string): Promise<{ duplicate: boolean }>;
}

function stripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  return new Stripe(env.STRIPE_SECRET_KEY);
}

function subscriptionEnd(subscription: Stripe.Subscription): Date | null {
  const value = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return typeof value === "number" ? new Date(value * 1000) : null;
}

export function createStripeBillingService(repository: UserRepository): BillingService {
  return {
    async createCheckout() {
      if (!env.STRIPE_PRICE_ID) throw new Error("Stripe price is not configured");
      const stripe = stripeClient();
      const user = await repository.getDemoUser();
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
        customerId = customer.id;
        await repository.setStripeCustomer(customerId);
      }
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
        subscription_data: { metadata: { userId: user.id } },
        success_url: `${env.WEB_URL}/?checkout=success`,
        cancel_url: `${env.WEB_URL}/?checkout=cancelled`
      });
      if (!session.url) throw new Error("Stripe Checkout did not return a URL");
      return session.url;
    },
    async createPortal() {
      const stripe = stripeClient();
      const user = await repository.getDemoUser();
      if (!user.stripeCustomerId) throw new Error("No Stripe customer exists for this user");
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: env.WEB_URL
      });
      return session.url;
    },
    async processWebhook(payload, signature) {
      if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook secret is not configured");
      const stripe = stripeClient();
      const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
      if (await repository.hasStripeEvent(event.id)) return { duplicate: true };

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (subscriptionId && customerId && session.client_reference_id === DEMO_USER.id) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await repository.updateSubscription({
            customerId,
            subscriptionId,
            status: subscription.status,
            currentPeriodEnd: subscriptionEnd(subscription)
          });
        }
      }

      if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        await repository.updateSubscription({
          customerId,
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscriptionEnd(subscription)
        });
      }

      await repository.recordStripeEvent(event.id, event.type);
      return { duplicate: false };
    }
  };
}

