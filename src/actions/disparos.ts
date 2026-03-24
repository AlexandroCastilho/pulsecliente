"use server"

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ServiceResponse, successResponse, errorResponse } from '@/types/responses'

export async function processarDisparo(pesquisaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Usuário não autenticado.', 'UNAUTHORIZED')
    }

    // 1. Validar usuário e empresa
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true, nome: true }
    })

    if (!dbUser) {
      return errorResponse('Perfil de usuário não encontrado.', 'NOT_FOUND')
    }

    // 2. Validar pesquisa - usando select para evitar erro de colunas de data ausentes no prisma local
    const pesquisa = await prisma.pesquisa.findFirst({
      where: { id: pesquisaId, empresaId: dbUser.empresaId },
      select: { id: true, titulo: true }
    })

    if (!pesquisa) {
      return errorResponse('Pesquisa não encontrada ou acesso negado.', 'FORBIDDEN')
    }

    // 3. Buscar envios pendentes
    const pendentes = await prisma.envio.findMany({
      where: { pesquisaId, status: 'PENDENTE' }
    })

    if (pendentes.length === 0) {
      return errorResponse('Não há disparos pendentes para esta pesquisa.', 'NOT_FOUND')
    }

    // 4. Mudar status para PROCESSANDO (Atomicamente ou em lote)
    await prisma.envio.updateMany({
      where: { pesquisaId, status: 'PENDENTE' },
      data: { status: 'PROCESSANDO' }
    })

    // Chamar o Worker com o segredo de segurança (padrão fire-and-forget)
    const cronSecret = process.env.CRON_SECRET
    
    // Obter URL base dinamicamente
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
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

    if (baseUrl) {
      baseUrl = baseUrl.replace(/\/$/, '')
    }
    
    console.log(`[DISPARO] Iniciando worker em background: ${baseUrl}/api/disparos/processar`)

    // FIRE-AND-FORGET: Não aguardamos (no await) e usamos keepalive
    fetch(`${baseUrl}/api/disparos/processar`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      },
      body: JSON.stringify({ pesquisaId }),
      keepalive: true
    }).catch(err => {
      console.error('[FIRE-AND-FORGET ERROR]', err)
    })

    revalidatePath(`/pesquisas/${pesquisaId}`)
    revalidatePath(`/pesquisas/${pesquisaId}/envios`)
    revalidatePath('/dashboard')

    return successResponse({ count: pendentes.length })

  } catch (error) {
    console.error('[ERRO PROCESSAR DISPARO]', error)
    const message = error instanceof Error ? error.message : 'Erro interno ao iniciar disparos.'
    return errorResponse(message, 'INTERNAL_ERROR')
  }
}
