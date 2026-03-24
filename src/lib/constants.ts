export const PLAN_LIMITS = {
  FREE: 100,
  GROWTH: 2000,
  PREMIUM: 999999,
} as const;

export const PLAN_TO_PRICE: Record<"GROWTH" | "PREMIUM", string | undefined> = {
  GROWTH: process.env.STRIPE_PRICE_GROWTH_ID,
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM_ID,
};

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Fonte única de verdade para os limites de requisição.
// Atualize apenas aqui; proxy.ts e rate-limit.ts importam daqui.

/** Máximo de requisições por janela para rotas sensíveis (login, recuperar senha). */
export const RATE_LIMIT_GLOBAL = 5;

/** Máximo de requisições por janela exclusivo para rotas de autenticação. */
export const RATE_LIMIT_AUTH = 1;

/** Janela de tempo de rate limit (formato Upstash). */
export const RATE_LIMIT_WINDOW = '60 s' as const;
