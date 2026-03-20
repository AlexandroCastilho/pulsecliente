"use server"

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { processarDisparo } from './disparos'
import { revalidatePath } from 'next/cache'
import { ServiceResponse, successResponse, errorResponse } from '@/types/responses'

export async function importarContatos(
  pesquisaId: string, 
  contatos: { nome: string; email: string }[]
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Usuário não autenticado.', 'UNAUTHORIZED')
    }

    // 1. Validar se o usuário existe no Prisma e pegar empresaId
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) {
      return errorResponse('Perfil de usuário não encontrado.', 'NOT_FOUND')
    }

    // 2. Validar se a pesquisa pertence à empresa do usuário
    const pesquisa = await (prisma.pesquisa as any).findFirst({
      where: {
        id: pesquisaId,
        empresaId: dbUser.empresaId
      },
      select: { id: true }
    })

    if (!pesquisa) {
      return errorResponse('Pesquisa não encontrada ou acesso negado.', 'FORBIDDEN')
    }

    // 3. Preparar dados para inserção em massa
    const enviosData = contatos.map(c => ({
      pesquisaId,
      emailDestinatario: c.email,
      nomeDestinatario: c.nome,
      token: uuidv4(), // Token único para o link da pesquisa
      status: 'PENDENTE' as const
    }))

    // 4. Inserir usando createMany com skipDuplicates
    // O Prisma recomenda skipDuplicates para evitar erros em índices únicos (email + pesquisaId)
    const result = await prisma.envio.createMany({
      data: enviosData,
      skipDuplicates: true
    })

    console.log(`[IMPORTAÇÃO] ${result.count} novos contatos importados para a pesquisa ${pesquisaId}`)
    
    revalidatePath(`/pesquisas/${pesquisaId}/envios`)
    revalidatePath(`/pesquisas/${pesquisaId}`)
    revalidatePath('/dashboard')
    
    return successResponse({ count: result.count })

  } catch (error: any) {
    console.error('[ERRO IMPORTAR CONTATOS]', error)
    return errorResponse('Erro interno ao processar importação', 'INTERNAL_ERROR', error.message)
  }
}

export async function getHistoricoEnvios(pesquisaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) return []

    return await prisma.envio.findMany({
      where: {
        pesquisaId,
        pesquisa: { empresaId: dbUser.empresaId }
      },
      include: {
        pesquisa: {
          select: { titulo: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    })
  } catch (error) {
    console.error('[ERRO HISTÓRICO ENVIOS]', error)
    return []
  }
}

export async function getStatsEnvios(pesquisaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) return null

    const stats = await prisma.envio.groupBy({
      by: ['status'],
      where: {
        pesquisaId,
        pesquisa: { empresaId: dbUser.empresaId }
      },
      _count: {
        _all: true
      }
    })

    const total = stats.reduce((acc, curr) => acc + curr._count._all, 0)
    const respondidas = stats.find(s => s.status === 'RESPONDIDO')?._count._all || 0
    const erros = stats.find(s => s.status === 'ERRO')?._count._all || 0
    const pendentes = stats
      .filter(s => s.status === 'PENDENTE' || s.status === 'PROCESSANDO')
      .reduce((acc, curr) => acc + curr._count._all, 0)

    return {
      total,
      respondidas,
      erros,
      pendentes,
      taxaSucesso: total > 0 ? Math.round(((total - erros) / total) * 100) : 0
    }
  } catch (error) {
    console.error('[ERRO STATS ENVIOS]', error)
    return null
  }
}

export async function editarEReenviarEnvio(id: string, novoEmail: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Usuário não autenticado.', 'UNAUTHORIZED')
    }

    // 1. Validar empresa do usuário
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) {
      return errorResponse('Perfil não encontrado.', 'NOT_FOUND')
    }

    // 2. Localizar o envio e garantir que pertence à empresa
    const envio = await prisma.envio.findFirst({
      where: {
        id,
        pesquisa: { empresaId: dbUser.empresaId }
      }
    })

    if (!envio) {
      return errorResponse('Envio não encontrado ou acesso negado.', 'FORBIDDEN')
    }

    // 3. Atualizar o envio para PENDENTE e novo email
    await prisma.envio.update({
      where: { id },
      data: {
        emailDestinatario: novoEmail,
        status: 'PENDENTE',
        erroLog: null,
        enviadoEm: null,
        jobId: null
      }
    })

    // 4. Disparar novamente
    await processarDisparo(envio.pesquisaId)
    
    revalidatePath(`/pesquisas/${envio.pesquisaId}/envios`)
    revalidatePath(`/pesquisas/${envio.pesquisaId}`)
    revalidatePath('/dashboard')
    
    return successResponse(true)

  } catch (error: any) {
    console.error('[ERRO EDITAR E REENVIAR]', error)
    if (error.code === 'P2002') {
      return errorResponse('Este e-mail já existe na lista desta pesquisa.', 'CONFLICT')
    }
    return errorResponse('Erro ao processar edição e reenvio.', 'INTERNAL_ERROR')
  }
}
