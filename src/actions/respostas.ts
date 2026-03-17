"use server"

import prisma from '@/lib/prisma'

export async function salvarResposta(envioId: string, dados: any) {
  try {
    // 1. Verificar se o envio existe e ainda está pendente
    const envio = await prisma.envio.findUnique({
      where: { id: envioId },
      include: { pesquisa: true }
    })

    if (!envio) {
      return { success: false, message: 'Link de pesquisa inválido.' }
    }

    if (envio.status === 'RESPONDIDO') {
      return { success: false, message: 'Esta pesquisa já foi respondida. Obrigado!' }
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

    return { 
      success: true, 
      message: 'Resposta enviada com sucesso! Agradecemos sua participação.' 
    }

  } catch (error: any) {
    console.error('[ERRO SALVAR RESPOSTA]', error)
    return { 
      success: false, 
      message: 'Erro ao processar sua resposta. Tente novamente mais tarde.',
      details: error.message 
    }
  }
}
