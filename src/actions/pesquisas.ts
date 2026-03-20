"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { PesquisaInput } from "@/types/pesquisa"
import { revalidatePath } from "next/cache"

export async function salvarPesquisa(dados: PesquisaInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { 
        success: false, 
        message: "Usuário não autenticado. Por favor, faça login novamente." 
      }
    }

    // 1. Verificar a Existência do Usuário e Empresa (Tenant Check)
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser || !dbUser.empresaId) {
      return { 
        success: false, 
        message: "Perfil de usuário ou empresa não encontrado. Acesse o Dashboard primeiro para inicializar sua conta." 
      }
    }

    const { empresaId } = dbUser

    // 2. Transação para salvar Pesquisa e Perguntas
    const resultado = await prisma.$transaction(async (tx) => {
      // Criamos a pesquisa sem as datas primeiro para evitar erro de esquema no Prisma Client local
      const novaPesquisa = await (tx as any).pesquisa.create({
        data: {
          titulo: dados.titulo,
          descricao: dados.descricao,
          empresaId: empresaId,
          perguntas: {
            create: dados.perguntas.map((p, index) => {
              const precisaDeOpcoes = p.tipo === 'MULTIPLA_ESCOLHA'
              const opcoesTratadas = precisaDeOpcoes ? (p.opcoes || []) : null

              return {
                titulo: p.titulo,
                tipo: p.tipo,
                opcoes: opcoesTratadas,
                obrigatoria: p.obrigatoria,
                ordem: index,
              }
            })
          }
        },
        select: { id: true }
      })

      // Injetamos as datas via SQL bruto
      if (dados.dataInicio || dados.dataFim) {
        const di = dados.dataInicio ? new Date(dados.dataInicio) : null
        const df = dados.dataFim ? new Date(dados.dataFim) : null
        
        await (tx as any).$executeRaw`
          UPDATE pesquisas SET "dataInicio" = ${di}, "dataFim" = ${df} WHERE id = ${novaPesquisa.id}
        `
      }

      return novaPesquisa
    })

    console.log(`[PESQUISA CRIADA] ID: ${resultado.id} por Usuário: ${user.id}`)
    
    // Revalidar as rotas que dependem das pesquisas
    revalidatePath('/pesquisas')
    revalidatePath('/dashboard')
    
    return { success: true, id: resultado.id }

  } catch (error: any) {
    console.error("[ERRO SALVAR PESQUISA]", error)
    return { 
      success: false, 
      message: "Ocorreu um erro técnico ao salvar a pesquisa.",
      details: error.message 
    }
  }
}

export async function excluirPesquisa(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Usuário não autenticado." }
    }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) {
      return { success: false, message: "Perfil não encontrado." }
    }

    // 1. Verificar se a pesquisa pertence à empresa do usuário
    const pesquisa = await (prisma.pesquisa as any).findFirst({
      where: { 
        id,
        empresaId: dbUser.empresaId
      },
      select: { id: true }
    })

    if (!pesquisa) {
      return { success: false, message: "Pesquisa não encontrada ou acesso negado." }
    }

    // 2. Excluir (Cascata cuidará das perguntas e envios se configurado no prisma)
    await (prisma.pesquisa as any).delete({
      where: { id }
    })

    console.log(`[PESQUISA EXCLUÍDA] ID: ${id} por Usuário: ${user.id}`)
    
    // Revalidar as rotas que dependem das pesquisas
    revalidatePath('/pesquisas')
    revalidatePath('/dashboard')
    
    return { success: true, message: "Pesquisa excluída com sucesso." }

  } catch (error: any) {
    console.error("[ERRO EXCLUIR PESQUISA]", error)
    return { 
      success: false, 
      message: "Erro ao excluir a pesquisa.",
      details: error.message 
    }
  }
}

export async function atualizarDatasPesquisa(id: string, dataInicio?: string | Date | null, dataFim?: string | Date | null) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Não autorizado" }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    const pesquisa = await (prisma.pesquisa as any).findFirst({
      where: { id, empresaId: dbUser?.empresaId },
      select: { id: true }
    })

    if (!pesquisa) return { success: false, message: "Pesquisa não encontrada" }

    // Usamos SQL bruto para atualizar as datas pois o Prisma Client local pode estar sem as colunas no schema
    const di = dataInicio ? new Date(dataInicio) : null
    const df = dataFim ? new Date(dataFim) : null

    await prisma.$executeRaw`
      UPDATE pesquisas SET "dataInicio" = ${di}, "dataFim" = ${df} WHERE id = ${id}
    `

    revalidatePath(`/pesquisas/${id}`)
    revalidatePath('/pesquisas')
    
    return { success: true, message: "Datas atualizadas com sucesso!" }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
