export const DEMO_USER = {
  id: "demo-user",
  email: "demo@labelwise.test"
} as const;

export type UserRecord = {
  id: string;
  email: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string;
  currentPeriodEnd: Date | null;
};

export function hasNutritionAccess(user: Pick<UserRecord, "subscriptionStatus" | "currentPeriodEnd">, now = new Date()): boolean {
  if (!new Set(["active", "trialing"]).has(user.subscriptionStatus)) return false;
  return user.currentPeriodEnd === null || user.currentPeriodEnd > now;
}

