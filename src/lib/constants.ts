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
// Atualize apenas aqui; proxy.ts e ações de auth importam daqui.

/** Máximo de requisições por janela para rotas sensíveis (login, recuperar senha). */
export const RATE_LIMIT_GLOBAL = 10;

/** Máximo de requisições por janela exclusivo para rotas de autenticação. */
export const RATE_LIMIT_AUTH = 5;

/** Janela de tempo de rate limit (formato Upstash). */
export const RATE_LIMIT_WINDOW = '60 s' as const;

/** Rotas que devem ser protegidas por rate limit no Proxy/Middleware. */
export const AUTH_ROUTES = [
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/redefinir-senha',
  '/api/auth'
] as const;
