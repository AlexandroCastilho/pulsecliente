import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createRateLimiter } from '@/lib/rate-limit'

const ratelimit = createRateLimiter('@upstash/ratelimit', 5, '60 s')

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Rate Limiting para rotas sensíveis (Login e Recuperação de Senha)
  if (ratelimit && (
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/recuperar-senha') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) && request.method === 'POST') {
    const ip = (request as any).ip ?? "127.0.0.1"
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${ip}_${request.nextUrl.pathname}`
    )

    if (!success) {
      return new NextResponse('Muitas tentativas. Por favor, aguarde um minuto.', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      })
    }
  }

  // 2. Proteção de Rotas via Supabase Auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protger rotas do painel
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/pesquisas') || 
                           request.nextUrl.pathname.startsWith('/configuracoes') ||
                           request.nextUrl.pathname.startsWith('/equipe')

  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirecionar usuário logado se tentar acessar login/cadastro
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/cadastro')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
