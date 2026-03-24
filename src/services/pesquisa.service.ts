import prisma from '@/lib/prisma'
import { PesquisaInput } from '@/types/pesquisa'
import { ServiceResponse, successResponse, errorResponse } from '@/types/responses'
import { calculateNPS } from '@/lib/utils'

export class PesquisaService {
  /**
   * Cria uma nova pesquisa com suas perguntas
   */
  static async createPesquisa(dados: PesquisaInput, empresaId: string): Promise<ServiceResponse> {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        // 1. Criar a pesquisa base com as datas diretamente (agora suportado pelo schema)
        const di = dados.dataInicio ? new Date(dados.dataInicio) : null
        const df = dados.dataFim ? new Date(dados.dataFim) : null

        const novaPesquisa = await tx.pesquisa.create({
          data: {
            titulo: dados.titulo,
            descricao: dados.descricao,
            dataInicio: di,
            dataFim: df,
            empresaId: empresaId,
            perguntas: {
              create: dados.perguntas.map((p, index) => ({
                titulo: p.titulo,
                tipo: p.tipo,
                opcoes: p.tipo === 'MULTIPLA_ESCOLHA' ? (p.opcoes || []) : null,
                obrigatoria: p.obrigatoria,
                ordem: index,
              }))
            }
          },
          select: { id: true }
        })

        return novaPesquisa
      })

      return successResponse({ id: resultado.id })
    } catch (error) {
      console.error('[PesquisaService.createPesquisa]', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return errorResponse('Falha ao criar pesquisa no banco de dados', 'INTERNAL_ERROR', message)
    }
  }

  /**
   * Exclui uma pesquisa validando o pertencimento à empresa
   */
  static async deletePesquisa(id: string, empresaId: string): Promise<ServiceResponse> {
    try {
      const pesquisa = await prisma.pesquisa.findFirst({
        where: { id, empresaId },
        select: { id: true }
      })

      if (!pesquisa) {
        return errorResponse('Pesquisa não encontrada ou acesso negado', 'NOT_FOUND')
      }

      await prisma.pesquisa.delete({ where: { id } })
      return successResponse(true)
    } catch (error) {
      console.error('[PesquisaService.deletePesquisa]', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return errorResponse('Erro ao excluir pesquisa', 'INTERNAL_ERROR', message)
    }
  }

  /**
   * Atualiza as datas de uma pesquisa
   */
  static async updateDatas(id: string, empresaId: string, dataInicio?: Date | null, dataFim?: Date | null): Promise<ServiceResponse> {
    try {
      const pesquisa = await prisma.pesquisa.findFirst({
        where: { id, empresaId },
        select: { id: true }
      })

      if (!pesquisa) return errorResponse('Pesquisa não encontrada', 'NOT_FOUND')

      await prisma.pesquisa.update({
        where: { id },
        data: { dataInicio, dataFim }
      })

      return successResponse(true)
    } catch (error) {
      console.error('[PesquisaService.updateDatas]', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return errorResponse('Erro ao atualizar datas', 'INTERNAL_ERROR', message)
    }
  }

  /**
   * Calcula o NPS Global de uma empresa
   */
  static async getGlobalNPS(empresaId: string): Promise<ServiceResponse<number>> {
    try {
      const respostas = await prisma.resposta.findMany({
        where: { envio: { pesquisa: { empresaId } } },
        select: { 
          dados: true,
          envio: {
            select: {
              pesquisa: {
                select: {
                  perguntas: { where: { tipo: 'ESCALA_NPS' }, select: { id: true } }
                }
              }
            }
          }
        }
      })

      const notas: number[] = []
      respostas.forEach(r => {
        const dados = r.dados as Record<string, unknown>
        r.envio.pesquisa.perguntas.forEach(p => {
          const valor = dados[p.id]
          if (typeof valor === 'number') {
            notas.push(valor)
          }
        })
      })

      return successResponse(calculateNPS(notas))
    } catch (error) {
      console.error('[PesquisaService.getGlobalNPS]', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return errorResponse('Erro ao calcular NPS', 'INTERNAL_ERROR', message)
    }
  }
}
