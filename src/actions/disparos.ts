"use server"

import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function processarDisparo(pesquisaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' }
    }

    // 1. Validar usuário e empresa
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true, nome: true }
    })

    if (!dbUser) {
      return { success: false, message: 'Perfil de usuário não encontrado.' }
    }

    // 2. Validar pesquisa - usando select para evitar erro de colunas de data ausentes no prisma local
    const pesquisa = await (prisma.pesquisa as any).findFirst({
      where: { id: pesquisaId, empresaId: dbUser.empresaId },
      select: { id: true, titulo: true }
    })

    if (!pesquisa) {
      return { success: false, message: 'Pesquisa não encontrada ou acesso negado.' }
    }

    // 3. Buscar envios pendentes
    const pendentes = await prisma.envio.findMany({
      where: { pesquisaId, status: 'PENDENTE' }
    })

    if (pendentes.length === 0) {
      return { success: false, message: 'Não há disparos pendentes para esta pesquisa.' }
    }

    // 4. Mudar status para PROCESSANDO (Atomicamente ou em lote)
    await prisma.envio.updateMany({
      where: { pesquisaId, status: 'PENDENTE' },
      data: { status: 'PROCESSANDO' }
    })

    // Chamar o Worker com o segredo de segurança
    const cronSecret = process.env.CRON_SECRET
    
    // Obter URL base dinamicamente se não estiver no env
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    
    // Em desenvolvimento local, preferir sempre localhost para evitar problemas de rede
    if (process.env.NODE_ENV === 'development') {
      baseUrl = 'http://localhost:3000'
    } else if (!baseUrl) {
      try {
        const { headers } = await import('next/headers')
        const host = (await headers()).get('host')
        const protocol = host?.includes('localhost') ? 'http' : 'https'
        baseUrl = `${protocol}://${host}`
      } catch (err) {
        baseUrl = 'http://localhost:3000'
      }
    }

    // Remover barra final para evitar URLs como http://localhost:3000//api/... (Causa 404)
    if (baseUrl) {
      baseUrl = baseUrl.replace(/\/$/, '')
    }
    
    console.log(`[DISPARO] Chamando worker em: ${baseUrl}/api/disparos/processar`)

    try {
      const response = await fetch(`${baseUrl}/api/disparos/processar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`
        },
        body: JSON.stringify({ pesquisaId })
      })

      const responseData = await response.json().catch(() => ({}))
      console.log(`[DISPARO] Resposta do worker:`, response.status, responseData)
      
      if (!response.ok) {
        // Se falhou ao chamar o worker, voltamos para PENDENTE para permitir nova tentativa
        await prisma.envio.updateMany({
          where: { pesquisaId, status: 'PROCESSANDO' },
          data: { status: 'PENDENTE', erroLog: `Worker falhou (${response.status}): ${JSON.stringify(responseData)}` }
        })
        return { success: false, message: `Erro no worker: ${response.status}` }
      }
    } catch (err: any) {
      console.error('[FETCH WORKER ERROR]', err)
      // Reverter para PENDENTE em caso de erro de rede/conexão
      await prisma.envio.updateMany({
        where: { pesquisaId, status: 'PROCESSANDO' },
        data: { status: 'PENDENTE', erroLog: `Erro de conexão: ${err.message}` }
      })
      return { success: false, message: `Erro de conexão com o servidor: ${err.message}` }
    }

    // Revalidar para que a UI se atualize
    revalidatePath(`/pesquisas/${pesquisaId}`)
    revalidatePath(`/pesquisas/${pesquisaId}/envios`)
    revalidatePath('/dashboard')

    return { 
      success: true, 
      count: pendentes.length,
      message: `${pendentes.length} disparos iniciados. O processamento continuará em segundo plano.` 
    }

  } catch (error: any) {
    console.error('[ERRO PROCESSAR DISPARO]', error)
    return { 
      success: false, 
      message: 'Erro interno ao iniciar disparos.',
      details: error.message 
    }
  }
}
