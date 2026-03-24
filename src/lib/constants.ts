export const PLAN_LIMITS = {
  FREE: 100,
  GROWTH: 2000,
  PREMIUM: 999999,
} as const;

export const PLAN_TO_PRICE: Record<"GROWTH" | "PREMIUM", string | undefined> = {
  GROWTH: process.env.STRIPE_PRICE_GROWTH_ID,
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM_ID,
};
