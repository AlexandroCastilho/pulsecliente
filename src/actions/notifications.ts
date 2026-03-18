"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getNotificacoes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  return await prisma.notificacao.findMany({
    where: { 
      usuarioId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })
}

export async function marcarComoLida(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false }

  await prisma.notificacao.update({
    where: { 
      id,
      usuarioId: user.id
    },
    data: { lida: true }
  })

  revalidatePath("/")
  return { success: true }
}

export async function marcarTodasComoLidas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false }

  await prisma.notificacao.updateMany({
    where: { 
      usuarioId: user.id,
      lida: false
    },
    data: { lida: true }
  })

  revalidatePath("/")
  return { success: true }
}

// Função utilitária para criar notificações internamente
export async function criarNotificacao(usuarioId: string, titulo: string, mensagem: string, tipo: string = 'SISTEMA') {
  return await prisma.notificacao.create({
    data: {
      usuarioId,
      titulo,
      mensagem,
      tipo
    }
  })
}
