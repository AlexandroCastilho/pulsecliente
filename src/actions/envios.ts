"use server"

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function importarContatos(
  pesquisaId: string, 
  contatos: { nome: string; email: string }[]
) {
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

    return { 
      success: true, 
      count: result.count,
      message: `${result.count} contatos importados com sucesso!` 
    }

  } catch (error: any) {
    console.error('[ERRO IMPORTAR CONTATOS]', error)
    return { 
      success: false, 
      message: 'Erro interno ao processar importação.',
      details: error.message 
    }
  }
}
