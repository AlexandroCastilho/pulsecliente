"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { sanitizeErrorMessage } from "@/lib/error-handler"

export async function addMembro(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, empresaId: true, role: true }
    })

    if (!dbUser || (dbUser.role !== 'OWNER' && dbUser.role !== 'ADMIN')) {
      throw new Error("Permissão negada")
    }

    const nome = formData.get("nome") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as Role

    const existing = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existing) {
      throw new Error("Este e-mail já está em uso por outro utilizador.")
    }

    await prisma.usuario.create({
      data: {
        id: `pending_${Math.random().toString(36).substring(7)}`,
        email,
        nome,
        role,
        empresaId: dbUser.empresaId,
        ativo: true
      }
    })

    revalidatePath("/equipe")
    return { success: true }
  } catch (error) {
    return { success: false, message: sanitizeErrorMessage(error) }
  }
}

export async function updateMembroRole(membroId: string, newRole: Role) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, empresaId: true, role: true }
    })

    if (!dbUser || dbUser.role !== 'OWNER') {
      throw new Error("Apenas o Owner pode alterar funções de nível Owner.")
    }

    await prisma.usuario.update({
      where: { 
        id: membroId,
        empresaId: dbUser.empresaId 
      },
      data: { role: newRole }
    })

    revalidatePath("/equipe")
    return { success: true }
  } catch (error) {
    return { success: false, message: sanitizeErrorMessage(error) }
  }
}

export async function toggleMembroStatus(membroId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, empresaId: true, role: true }
    })

    if (!dbUser || (dbUser.role !== 'OWNER' && dbUser.role !== 'ADMIN')) {
      throw new Error("Permissão negada")
    }

    await prisma.usuario.update({
      where: { 
        id: membroId,
        empresaId: dbUser.empresaId
      },
      data: { ativo: !currentStatus }
    })

    revalidatePath("/equipe")
    return { success: true }
  } catch (error) {
    return { success: false, message: sanitizeErrorMessage(error) }
  }
}

export async function removerMembro(membroId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, empresaId: true, role: true }
    })

    if (!dbUser || dbUser.role !== 'OWNER') {
      throw new Error("Permissão negada")
    }

    if (dbUser.id === membroId) {
      throw new Error("Você não pode remover a si mesmo.")
    }

    await prisma.usuario.delete({
      where: { 
        id: membroId,
        empresaId: dbUser.empresaId
      }
    })

    revalidatePath("/equipe")
    return { success: true }
  } catch (error) {
    return { success: false, message: sanitizeErrorMessage(error) }
  }
}
