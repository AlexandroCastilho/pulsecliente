"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ServiceResponse, successResponse, errorResponse } from '@/types/responses'

export async function salvarResposta(envioId: string, dados: Record<string, string | string[] | number>) {
  try {
    // 1. Verificar se o envio existe e ainda está pendente
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
      include: { pesquisa: true }
    })

    if (!envio) {
      return errorResponse('Link de pesquisa inválido.', 'NOT_FOUND')
    }

    if (!envio.pesquisa.ativa) {
      return errorResponse('Esta pesquisa não está mais aceitando respostas.', 'FORBIDDEN')
    }

    if (envio.status === 'RESPONDIDO') {
      return errorResponse('Esta pesquisa já foi respondida. Obrigado!', 'CONFLICT')
    }

    // 2. Usar uma transação para garantir que a resposta seja salva e o status atualizado
    await prisma.$transaction([
      // Criar o registro de resposta
      prisma.resposta.create({
        data: {
          envioId: envioId,
          dados: dados
        }
      }),
      // Marcar o envio como respondido
      prisma.envio.update({
        where: { id: envioId },
        data: {
          status: 'RESPONDIDO'
        }
      })
    ])

    revalidatePath('/dashboard')
    revalidatePath(`/pesquisas/${envio.pesquisaId}`)
    revalidatePath(`/pesquisas/${envio.pesquisaId}/envios`)

    return successResponse(true)

  } catch (error: any) {
    console.error('[ERRO SALVAR RESPOSTA]', error)
    return errorResponse('Erro ao processar sua resposta. Tente novamente mais tarde.', 'INTERNAL_ERROR')
  }
}
