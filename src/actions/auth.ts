"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { sanitizeErrorMessage } from "@/lib/error-handler"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

  export async function solicitarRecuperacaoSenha(formData: FormData) {
    const email = formData.get('email') as string

    if (!email) {
      return { error: 'E-mail é obrigatório.' }
    }

    const supabase = await createServerClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return { error: sanitizeErrorMessage(error.message) }
    }

    return { success: true }
  }

  export async function redefinirSenha(formData: FormData) {
    const password = formData.get('password') as string
    const confirmation = formData.get('confirmation') as string

    if (!password || password.length < 6) {
      return { error: 'A senha deve ter pelo menos 6 caracteres.' }
    }

    if (password !== confirmation) {
      return { error: 'As senhas não coincidem.' }
    }

    const supabase = await createServerClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return { error: sanitizeErrorMessage(error.message) }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
  }

// Supabase Admin Client (Usando Service Role Key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function validarTokenConvite(token: string) {
  try {
    const convite = await prisma.convite.findUnique({
      where: { token },
      include: { empresa: { select: { nome: true } } }
    })

    if (!convite || convite.status !== 'PENDING') {
      return { success: false, message: "Convite inválido ou já utilizado." }
    }

    if (new Date() > convite.expiresAt) {
      return { success: false, message: "Este convite expirou." }
    }

    return { success: true, convite }
  } catch (error) {
    return { success: false, message: "Erro ao validar convite." }
  }
}

export async function finalizarAceiteConvite(token: string, senha: string) {
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

    return { success: true }
  } catch (error) {
    console.error('[ACEITE CONVITE ERROR]', error)
    return { success: false, message: sanitizeErrorMessage(error) }
  }
}
