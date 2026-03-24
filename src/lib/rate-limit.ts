import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { RATE_LIMIT_AUTH, RATE_LIMIT_WINDOW } from '@/lib/constants'

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Exportadas para compatibilidade retroativa com código legado que as importa diretamente.
// Novas referências devem usar as constantes de @/lib/constants.
export { RATE_LIMIT_AUTH as AUTH_RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW as AUTH_RATE_LIMIT_WINDOW }
export const AUTH_RATE_LIMIT_SECONDS = 60

type SlidingWindowDuration = Parameters<typeof Ratelimit.slidingWindow>[1]

export function createRateLimiter(prefix: string, maxRequests = RATE_LIMIT_AUTH, window: SlidingWindowDuration = RATE_LIMIT_WINDOW) {
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window),
    analytics: true,
    prefix,
  })
}

export function buildEmailIpRateLimitKey(email: string, clientId: string) {
  return `${email.trim().toLowerCase()}:${clientId}`
}
