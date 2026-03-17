"use server"

import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

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

    // 2. Validar pesquisa
    const pesquisa = await prisma.pesquisa.findFirst({
      where: { id: pesquisaId, empresaId: dbUser.empresaId }
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

    // 5. Chamar o Worker em Segundo Plano (Fire-and-Forget)
    // Usamos o cabeçalho base de URL do env ou localhost
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Disparamos o fetch SEM o await para não bloquear o retorno da Action
    fetch(`${appUrl}/api/disparos/processar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesquisaId })
    }).catch(err => console.error('[FETCH WORKER ERROR]', err))

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
