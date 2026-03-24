"use server"

import { authAction } from "@/lib/auth-guard"
import { logStructuredError } from "@/lib/error-handler"
import { PesquisaInput } from "@/types/pesquisa"
import { revalidatePath } from "next/cache"
import { PesquisaService } from "@/services/pesquisa.service"
import { ServiceResponse, errorResponse } from "@/types/responses"

export async function salvarPesquisa(dados: PesquisaInput): Promise<ServiceResponse<{ id: string }>> {
  try {
    return await authAction(dados, undefined, async (input, user) => {
      const result = await PesquisaService.createPesquisa(input, user.empresaId)

      if (result.success) {
        console.log(`[PESQUISA CRIADA] ID: ${result.data.id} por Usuário: ${user.id}`)
        revalidatePath('/pesquisas')
        revalidatePath('/dashboard')
      }

      return result
    })
  } catch (error: unknown) {
    logStructuredError(error, { actionName: 'salvarPesquisa' })
    return errorResponse("Erro técnico ao processar salvamento", "INTERNAL_ERROR")
  }
}

export async function excluirPesquisa(id: string): Promise<ServiceResponse<boolean>> {
  try {
    return await authAction(id, ['OWNER', 'ADMIN'], async (pesquisaId, user) => {
      const result = await PesquisaService.deletePesquisa(pesquisaId, user.empresaId)

      if (result.success) {
        console.log(`[PESQUISA EXCLUÍDA] ID: ${pesquisaId} por Usuário: ${user.id}`)
        revalidatePath('/pesquisas')
        revalidatePath('/dashboard')
      }

      return result
    })
  } catch (error: unknown) {
    logStructuredError(error, { actionName: 'excluirPesquisa' })
    return errorResponse("Erro interno ao excluir pesquisa", "INTERNAL_ERROR")
  }
}

export async function atualizarDatasPesquisa(
  id: string,
  dataInicio?: string | Date | null,
  dataFim?: string | Date | null
): Promise<ServiceResponse<boolean>> {
  try {
    return await authAction({ id, dataInicio, dataFim }, ['OWNER', 'ADMIN'], async (input, user) => {
      const di = input.dataInicio ? new Date(input.dataInicio) : null
      const df = input.dataFim ? new Date(input.dataFim) : null

      const result = await PesquisaService.updateDatas(input.id, user.empresaId, di, df)

      if (result.success) {
        revalidatePath(`/pesquisas/${input.id}`)
        revalidatePath('/pesquisas')
      }

      return result
    })
  } catch (error: unknown) {
    logStructuredError(error, { actionName: 'atualizarDatasPesquisa' })
    return errorResponse("Erro ao atualizar datas", "INTERNAL_ERROR")
  }
}
