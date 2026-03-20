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
        // 1. Criar a pesquisa base
        const novaPesquisa = await (tx as any).pesquisa.create({
          data: {
            titulo: dados.titulo,
            descricao: dados.descricao,
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

        // 2. Injetar datas via SQL bruto (devido a incompatibilidade do client local)
        if (dados.dataInicio || dados.dataFim) {
          const di = dados.dataInicio ? new Date(dados.dataInicio) : null
          const df = dados.dataFim ? new Date(dados.dataFim) : null
          
          await (tx as any).$executeRaw`
            UPDATE pesquisas SET "dataInicio" = ${di}, "dataFim" = ${df} WHERE id = ${novaPesquisa.id}
          `
        }

        return novaPesquisa
      })

      return successResponse({ id: resultado.id })
    } catch (error: any) {
      console.error('[PesquisaService.createPesquisa]', error)
      return errorResponse('Falha ao criar pesquisa no banco de dados', 'INTERNAL_ERROR', error.message)
    }
  }

  /**
   * Exclui uma pesquisa validando o pertencimento à empresa
   */
  static async deletePesquisa(id: string, empresaId: string): Promise<ServiceResponse> {
    try {
      const pesquisa = await (prisma.pesquisa as any).findFirst({
        where: { id, empresaId },
        select: { id: true }
      })

      if (!pesquisa) {
        return errorResponse('Pesquisa não encontrada ou acesso negado', 'NOT_FOUND')
      }

      await (prisma.pesquisa as any).delete({ where: { id } })
      return successResponse(true)
    } catch (error: any) {
      console.error('[PesquisaService.deletePesquisa]', error)
      return errorResponse('Erro ao excluir pesquisa', 'INTERNAL_ERROR', error.message)
    }
  }

  /**
   * Atualiza as datas de uma pesquisa
   */
  static async updateDatas(id: string, empresaId: string, dataInicio?: Date | null, dataFim?: Date | null): Promise<ServiceResponse> {
    try {
      const pesquisa = await (prisma.pesquisa as any).findFirst({
        where: { id, empresaId },
        select: { id: true }
      })

      if (!pesquisa) return errorResponse('Pesquisa não encontrada', 'NOT_FOUND')

      await prisma.$executeRaw`
        UPDATE pesquisas SET "dataInicio" = ${dataInicio}, "dataFim" = ${dataFim} WHERE id = ${id}
      `

      return successResponse(true)
    } catch (error: any) {
      console.error('[PesquisaService.updateDatas]', error)
      return errorResponse('Erro ao atualizar datas', 'INTERNAL_ERROR', error.message)
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
        const dados = r.dados as Record<string, any>
        r.envio.pesquisa.perguntas.forEach(p => {
          if (typeof dados[p.id] === 'number') notas.push(dados[p.id])
        })
      })

      return successResponse(calculateNPS(notas))
    } catch (error: any) {
      console.error('[PesquisaService.getGlobalNPS]', error)
      return errorResponse('Erro ao calcular NPS', 'INTERNAL_ERROR', error.message)
    }
  }
}
