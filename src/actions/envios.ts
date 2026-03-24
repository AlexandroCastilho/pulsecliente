"use server"

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { processarDisparo } from './disparos'
import { revalidatePath } from 'next/cache'
import { ServiceResponse, successResponse, errorResponse } from '@/types/responses'

import { PLAN_LIMITS } from '@/lib/constants'

import { z } from "zod"

const ImportSchema = z.object({
  pesquisaId: z.string().uuid("ID de pesquisa inválido"),
  contatos: z.array(z.object({
    nome: z.string().min(1, "Nome obrigatório"),
    email: z.string().email("E-mail inválido")
  })).min(1, "Nenhum contato enviado")
})

export async function importarContatos(
  pesquisaId: string, 
  contatos: { nome: string; email: string }[]
): Promise<ServiceResponse<{ count: number }>> {
  try {
    // 0. Validação Zod
    const validated = ImportSchema.safeParse({ pesquisaId, contatos })

    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Usuário não autenticado.', 'UNAUTHORIZED')
    }

    // 1. Validar se o usuário existe no Prisma e pegar empresaId e plano
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      include: { empresa: true }
    })

    if (!dbUser) {
      return errorResponse('Perfil de usuário não encontrado.', 'NOT_FOUND')
    }

    // 2. Verificar Cotas do Plano
    const plano = dbUser.empresa.plano as keyof typeof PLAN_LIMITS
    const limite = PLAN_LIMITS[plano] || 100

    const inicioDoMes = new Date()
    inicioDoMes.setDate(1)
    inicioDoMes.setHours(0, 0, 0, 0)

    const totalEnviadoMes = await prisma.envio.count({
      where: {
        pesquisa: { empresaId: dbUser.empresaId },
        createdAt: { gte: inicioDoMes }
      }
    })

    if (totalEnviadoMes + contatos.length > limite) {
      return errorResponse(`Limite de envios excedido (${totalEnviadoMes}/${limite}). Faça um upgrade para enviar mais.`, 'FORBIDDEN')
    }

    // 3. Validar se a pesquisa pertence à empresa do usuário
    const pesquisa = await prisma.pesquisa.findFirst({
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

  } catch (error) {
    console.error('[ERRO IMPORTAR CONTATOS]', error)
    const message = error instanceof Error ? error.message : 'Erro interno ao processar importação'
    return errorResponse('Erro interno ao processar importação', 'INTERNAL_ERROR', message)
  }
}

export async function getHistoricoEnvios(pesquisaId: string, search?: string, page: number = 1) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: [], total: 0, totalPages: 0 }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) return { data: [], total: 0, totalPages: 0 }

    const take = 50
    const skip = (page - 1) * take

    const where: Prisma.EnvioWhereInput = {
      pesquisaId,
      pesquisa: { empresaId: dbUser.empresaId },
      ...(search ? {
        OR: [
          { emailDestinatario: { contains: search, mode: 'insensitive' } },
          { nomeDestinatario: { contains: search, mode: 'insensitive' } },
        ]
      } : {})
    }

    const [data, total] = await Promise.all([
      prisma.envio.findMany({
        where,
        include: {
          pesquisa: {
            select: { titulo: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take,
        skip
      }),
      prisma.envio.count({ where })
    ])

    return {
      data,
      total,
      totalPages: Math.ceil(total / take)
    }
  } catch (error) {
    console.error('[ERRO HISTÓRICO ENVIOS]', error)
    return { data: [], total: 0, totalPages: 0 }
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

  } catch (error) {
    console.error('[ERRO EDITAR E REENVIAR]', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return errorResponse('Este e-mail já existe na lista desta pesquisa.', 'CONFLICT')
    }
    return errorResponse('Erro ao processar edição e reenvio.', 'INTERNAL_ERROR')
  }
}
