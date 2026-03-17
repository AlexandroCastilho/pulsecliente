"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getSmtpConfig() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  })

  if (!dbUser) return null

  return await prisma.smtpConfig.findUnique({
    where: { empresaId: dbUser.empresaId }
  })
}

export async function saveSmtpConfig(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  })

  if (!dbUser) throw new Error("Empresa não encontrada")

  const host = formData.get("host") as string
  const port = parseInt(formData.get("port") as string)
  const userSmtp = formData.get("user") as string
  const pass = formData.get("pass") as string
  const fromName = formData.get("fromName") as string
  const fromEmail = formData.get("fromEmail") as string

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

  revalidatePath("/configuracoes")
  return { success: true }
}
