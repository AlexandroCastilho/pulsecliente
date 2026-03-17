"use server"

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function processarDisparo(pesquisaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' }
    }

    // 1. Validar se o usuário existe no Prisma e pegar empresaId
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) {
      return { success: false, message: 'Perfil de usuário não encontrado.' }
    }

    // 2. Validar se a pesquisa pertence à empresa do usuário
    const pesquisa = await prisma.pesquisa.findFirst({
      where: {
        id: pesquisaId,
        empresaId: dbUser.empresaId
      }
    })

    if (!pesquisa) {
      return { success: false, message: 'Pesquisa não encontrada ou acesso negado.' }
    }

    // 3. Buscar envios pendentes para esta pesquisa
    const pendentes = await prisma.envio.findMany({
      where: {
        pesquisaId,
        status: 'PENDENTE'
      }
    })

    if (pendentes.length === 0) {
      return { success: false, message: 'Não há disparos pendentes para esta pesquisa.' }
    }

    // 4. Simular processamento (Atualizar para ENVIADO)
    // Em um cenário real, aqui dispararíamos e-mails via SendGrid/Resend
    const result = await prisma.envio.updateMany({
      where: {
        pesquisaId,
        status: 'PENDENTE'
      },
      data: {
        status: 'ENVIADO',
        enviadoEm: new Date()
      }
    })

    console.log(`[DISPARO] ${result.count} pesquisas disparadas para a pesquisa ${pesquisaId}`)

    return { 
      success: true, 
      count: result.count,
      message: `${result.count} pesquisas disparadas com sucesso!` 
    }

  } catch (error: any) {
    console.error('[ERRO PROCESSAR DISPARO]', error)
    return { 
      success: false, 
      message: 'Erro interno ao processar disparos.',
      details: error.message 
    }
  }
}
