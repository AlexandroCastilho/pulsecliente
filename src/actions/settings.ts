"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getSettingsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { 
      empresa: {
        include: {
          smtpConfig: true
        }
      }
    }
  })

  if (!dbUser) return null

  return {
    user: {
      nome: dbUser.nome,
      email: dbUser.email
    },
    empresa: {
      nome: dbUser.empresa.nome,
      id: dbUser.empresaId
    },
    smtp: dbUser.empresa.smtpConfig
  }
}

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  if (!supabaseUser) throw new Error("Não autenticado")

  const dbUser = await prisma.usuario.findUnique({
    where: { id: supabaseUser.id },
    select: { empresaId: true, id: true }
  })

  if (!dbUser) throw new Error("Usuário não encontrado")

  // 1. Dados do Usuário
  const userName = formData.get("userName") as string
  if (userName) {
    await prisma.usuario.update({
      where: { id: dbUser.id },
      data: { nome: userName }
    })
  }

  // 2. Dados da Empresa
  const companyName = formData.get("companyName") as string
  if (companyName) {
    await prisma.empresa.update({
      where: { id: dbUser.empresaId },
      data: { nome: companyName }
    })
  }

  // 3. Dados SMTP
  const host = formData.get("host") as string
  const portStr = formData.get("port") as string
  const userSmtp = formData.get("user") as string
  const pass = formData.get("pass") as string
  const fromName = formData.get("fromName") as string
  const fromEmail = formData.get("fromEmail") as string

  // Só tenta salvar SMTP se pelo menos o host for preenchido
  if (host) {
    const port = parseInt(portStr) || 587
    await prisma.smtpConfig.upsert({
      where: { empresaId: dbUser.empresaId },
      update: {
        host,
        port,
        user: userSmtp,
        pass,
        fromName,
        fromEmail
      },
      create: {
        host,
        port,
        user: userSmtp,
        pass,
        fromName,
        fromEmail,
        empresaId: dbUser.empresaId
      }
    })
  }

  revalidatePath("/configuracoes")
  revalidatePath("/(painel)", "layout") // Revalida o layout para atualizar o Header/Sidebar
  return { success: true }
}
