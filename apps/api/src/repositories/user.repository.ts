import { prisma } from "../db/prisma.js";
import { DEMO_USER, type UserRecord } from "../domain/user.js";

export type RecentSearch = { id: string; term: string; locale: string; createdAt: Date };

export interface UserRepository {
  getDemoUser(): Promise<UserRecord>;
  recordSearch(term: string, locale: string): Promise<void>;
  getRecentSearches(): Promise<RecentSearch[]>;
  setStripeCustomer(customerId: string): Promise<void>;
  updateSubscription(input: {
    customerId: string;
    subscriptionId: string;
    status: string;
    currentPeriodEnd: Date | null;
  }): Promise<void>;
  hasStripeEvent(eventId: string): Promise<boolean>;
  recordStripeEvent(eventId: string, type: string): Promise<void>;
}

export const prismaUserRepository: UserRepository = {
  async getDemoUser() {
    return prisma.user.upsert({
      where: { id: DEMO_USER.id },
      update: {},
      create: DEMO_USER
    });
  },
  async recordSearch(term, locale) {
    await this.getDemoUser();
    await prisma.search.create({ data: { term, locale, userId: DEMO_USER.id } });
  },
  async getRecentSearches() {
    return prisma.search.findMany({
      where: { userId: DEMO_USER.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      distinct: ["term"]
    });
  },
  async setStripeCustomer(customerId) {
    await prisma.user.update({ where: { id: DEMO_USER.id }, data: { stripeCustomerId: customerId } });
  },
  async updateSubscription(input) {
    await prisma.user.update({
      where: { id: DEMO_USER.id },
      data: {
        stripeCustomerId: input.customerId,
        stripeSubscriptionId: input.subscriptionId,
        subscriptionStatus: input.status,
        currentPeriodEnd: input.currentPeriodEnd
      }
    });
  },
  async hasStripeEvent(eventId) {
    return (await prisma.stripeEvent.count({ where: { id: eventId } })) > 0;
  },
  async recordStripeEvent(eventId, type) {
    await prisma.stripeEvent.create({ data: { id: eventId, type } });
  }
};

