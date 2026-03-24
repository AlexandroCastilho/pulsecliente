"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { sanitizeErrorMessage } from "@/lib/error-handler"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from 'next/headers'
import { ServiceResponse, successResponse, errorResponse } from '@/types/responses'
import { AUTH_RATE_LIMIT_SECONDS, buildEmailIpRateLimitKey, createRateLimiter } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'

const resendEmailRateLimit = createRateLimiter('@upstash/ratelimit:auth:resend-confirmation')
const passwordRecoveryRateLimit = createRateLimiter('@upstash/ratelimit:auth:password-recovery')

async function getAppUrl() {
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (envAppUrl) {
    return envAppUrl
  }

  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')

  if (host) {
    return `${protocol}://${host}`
  }

  return 'http://localhost:3000'
}

async function getClientIdentifier() {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get('x-forwarded-for')
  const realIp = requestHeaders.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
  return ip
}

export async function login(formData: FormData): Promise<ServiceResponse> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return errorResponse(sanitizeErrorMessage(error.message), 'UNAUTHORIZED')
  }

  revalidatePath('/', 'layout')
  return successResponse(true)
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

  export async function solicitarRecuperacaoSenha(formData: FormData): Promise<ServiceResponse> {
    const email = formData.get('email') as string

    if (!email) {
      return errorResponse('E-mail é obrigatório.', 'VALIDATION_ERROR')
    }

      if (passwordRecoveryRateLimit) {
        const clientId = await getClientIdentifier()
        const rateLimitKey = buildEmailIpRateLimitKey(email, clientId)
        const { success } = await passwordRecoveryRateLimit.limit(rateLimitKey)

        if (!success) {
          return errorResponse(`Aguarde ${AUTH_RATE_LIMIT_SECONDS} segundos antes de solicitar uma nova recuperação de senha.`, 'VALIDATION_ERROR')
        }
      }

    const supabase = await createServerClient()
    const appUrl = await getAppUrl()
    const redirectTo = `${appUrl}/redefinir-senha`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return errorResponse(sanitizeErrorMessage(error.message), 'INTERNAL_ERROR')
    }

    return successResponse(true)
  }

  export async function redefinirSenha(formData: FormData): Promise<ServiceResponse> {
    const password = formData.get('password') as string
    const confirmation = formData.get('confirmation') as string

    if (!password || password.length < 6) {
      return errorResponse('A senha deve ter pelo menos 6 caracteres.', 'VALIDATION_ERROR')
    }

    if (password !== confirmation) {
      return errorResponse('As senhas não coincidem.', 'VALIDATION_ERROR')
    }

    const supabase = await createServerClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return errorResponse(sanitizeErrorMessage(error.message), 'INTERNAL_ERROR')
    }

    revalidatePath('/', 'layout')
    return successResponse(true)
  }

// Supabase Admin Client (Usando Service Role Key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function validarTokenConvite(token: string): Promise<ServiceResponse> {
  try {
    const convite = await prisma.convite.findUnique({
      where: { token },
      include: { empresa: { select: { nome: true } } }
    })

    if (!convite || convite.status !== 'PENDING') {
      return errorResponse("Convite inválido ou já utilizado.", 'NOT_FOUND')
    }

    if (new Date() > convite.expiresAt) {
      return errorResponse("Este convite expirou.", 'VALIDATION_ERROR')
    }

    return successResponse(convite)
  } catch (error) {
    return errorResponse("Erro ao validar convite.", 'INTERNAL_ERROR')
  }
}

export async function finalizarAceiteConvite(token: string, senha: string): Promise<ServiceResponse> {
  try {
    // 1. Validar convite novamente
    const convite = await prisma.convite.findUnique({
      where: { token }
    })

    if (!convite || convite.status !== 'PENDING' || new Date() > convite.expiresAt) {
      throw new Error("Convite inválido ou expirado.")
    }

    // 2. Criar utilizador no Supabase Auth via Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: convite.email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome: convite.nome }
    })

    if (authError) {
      // Se o erro for que o usuário já existe no Auth mas não no nosso banco (raro mas possível)
      if (authError.message.includes('already registered')) {
        throw new Error("Este e-mail já possui uma conta registrada. Tente fazer login.")
      }
      throw authError
    }

    const authUserId = authData.user?.id
    if (!authUserId) throw new Error("Erro ao obter ID do utilizador.")

    // 3. Criar registro na tabela Usuario do Prisma
    await prisma.usuario.create({
      data: {
        id: authUserId,
        email: convite.email,
        nome: convite.nome,
        role: convite.role,
        empresaId: convite.empresaId,
        ativo: true
      }
    })

    // 4. Marcar convite como ACEITO ou Deletar
    await prisma.convite.update({
      where: { id: convite.id },
      data: { status: 'ACCEPTED' }
    })

    return successResponse(true)
  } catch (error) {
    console.error('[ACEITE CONVITE ERROR]', error)
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}
export async function registrarConta(formData: FormData): Promise<ServiceResponse<{ requiresVerification: boolean }>> {
  const nome = formData.get('nome') as string
  const nomeEmpresa = formData.get('empresa') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Validações básicas
  if (!nome || !nomeEmpresa || !email || !password) {
    return errorResponse('Todos os campos são obrigatórios.', 'VALIDATION_ERROR')
  }

  if (password.length < 6) {
    return errorResponse('A senha deve ter pelo menos 6 caracteres.', 'VALIDATION_ERROR')
  }

  // 1.5 Verificar se o e-mail já existe no banco de dados
  const existingUser = await prisma.usuario.findUnique({
    where: { email }
  })

  if (existingUser) {
    const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(existingUser.id)

    if (authUserData?.user && !authUserError) {
      return errorResponse('Este e-mail já está cadastrado. Tente fazer login.', 'CONFLICT')
    }

    const clientId = await getClientIdentifier()
    console.warn('[AUTH ORPHAN USER CLEANUP]', {
      email,
      usuarioId: existingUser.id,
      clientId,
      reason: 'Usuário existe no Prisma, mas não foi encontrado no Supabase Auth',
      timestamp: new Date().toISOString(),
    })

    try {
      const auditRecipient = await prisma.usuario.findFirst({
        where: {
          empresaId: existingUser.empresaId,
          role: { in: ['OWNER', 'ADMIN'] },
          ativo: true,
        },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      })

      if (auditRecipient) {
        await prisma.notificacao.create({
          data: {
            usuarioId: auditRecipient.id,
            titulo: 'Correção automática de cadastro',
            mensagem: `Usuário órfão removido automaticamente para permitir novo cadastro: ${email}.`,
            tipo: 'AUDITORIA',
          },
        })
      }
    } catch (notificationError) {
      console.error('[AUTH ORPHAN USER AUDIT LOG ERROR]', notificationError)
    }

    await prisma.usuario.delete({
      where: { id: existingUser.id }
    })
  }

  try {
    const appUrl = await getAppUrl()
    const supabase = await createServerClient()

    // 2. Criar utilizador no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`
      }
    })

    if (authError) {
      return errorResponse(sanitizeErrorMessage(authError.message), 'INTERNAL_ERROR')
    }

    const authUserId = authData.user?.id
    if (!authUserId) throw new Error("Erro ao obter ID do utilizador.")

    // 3. Criar Empresa e Usuário no Prisma via Transação
    // Gerar slug básico: "Minha Empresa" -> "minha-empresa-123"
    const baseSlug = nomeEmpresa
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    const uniqueSuffix = uuidv4().replace(/-/g,'').substring(0,8)
    const slug = `${baseSlug}-${uniqueSuffix}`

    await prisma.$transaction(async (tx) => {
      // Criar a Empresa
      const empresa = await tx.empresa.create({
        data: {
          nome: nomeEmpresa,
          slug: slug,
          plano: 'FREE',
          assinaturaAtiva: true
        }
      })

      // Criar o Usuário OWNER
      await tx.usuario.create({
        data: {
          id: authUserId,
          email: email,
          nome: nome,
          role: 'OWNER',
          empresaId: empresa.id,
          ativo: true
        }
      })
    })

    // 4. Redirecionar após sucesso de cadastro
    const requiresVerification = !!(authData.user && !authData.session);
    return successResponse({ requiresVerification })
  } catch (error) {
    console.error('[REGISTRO ERROR]', error)
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}

export async function reenviarEmailConfirmacao(email: string): Promise<ServiceResponse> {
  if (!email) return errorResponse('E-mail é obrigatório.', 'VALIDATION_ERROR')

  try {
    if (resendEmailRateLimit) {
      const clientId = await getClientIdentifier()
      const rateLimitKey = buildEmailIpRateLimitKey(email, clientId)
      const { success } = await resendEmailRateLimit.limit(rateLimitKey)

      if (!success) {
        return errorResponse(`Aguarde ${AUTH_RATE_LIMIT_SECONDS} segundos antes de reenviar o e-mail de confirmação.`, 'VALIDATION_ERROR')
      }
    }

    const supabase = await createServerClient()
    const appUrl = await getAppUrl()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`
      }
    })

    if (error) return errorResponse(sanitizeErrorMessage(error.message), 'INTERNAL_ERROR')
    return successResponse(true)
  } catch (error) {
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}
