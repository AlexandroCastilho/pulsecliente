"use server"

import { getAuthenticatedUser } from "@/lib/auth-guard"
import { PesquisaInput } from "@/types/pesquisa"
import { revalidatePath } from "next/cache"
import { PesquisaService } from "@/services/pesquisa.service"
import { ServiceResponse, errorResponse } from "@/types/responses"

export async function salvarPesquisa(dados: PesquisaInput): Promise<ServiceResponse> {
  try {
    const user = await getAuthenticatedUser()
    const result = await PesquisaService.createPesquisa(dados, user.empresaId)

    if (result.success) {
      console.log(`[PESQUISA CRIADA] ID: ${result.data.id} por Usuário: ${user.id}`)
      revalidatePath('/pesquisas')
      revalidatePath('/dashboard')
    }
    
    return result
  } catch (error: any) {
    console.error("[ERRO SALVAR PESQUISA ACTION]", error)
    return errorResponse("Erro técnico ao processar salvamento", "INTERNAL_ERROR")
  }
}

export async function excluirPesquisa(id: string): Promise<ServiceResponse> {
  try {
    const user = await getAuthenticatedUser(['OWNER', 'ADMIN'])
    const result = await PesquisaService.deletePesquisa(id, user.empresaId)

    if (result.success) {
      console.log(`[PESQUISA EXCLUÍDA] ID: ${id} por Usuário: ${user.id}`)
      revalidatePath('/pesquisas')
      revalidatePath('/dashboard')
    }
    
    return result
  } catch (error: any) {
    console.error("[ERRO EXCLUIR PESQUISA ACTION]", error)
    return errorResponse("Erro interno ao excluir pesquisa", "INTERNAL_ERROR")
  }
}

export async function atualizarDatasPesquisa(
  id: string, 
  dataInicio?: string | Date | null, 
  dataFim?: string | Date | null
): Promise<ServiceResponse> {
  try {
    const user = await getAuthenticatedUser(['OWNER', 'ADMIN'])
    
    const di = dataInicio ? new Date(dataInicio) : null
    const df = dataFim ? new Date(dataFim) : null

    const result = await PesquisaService.updateDatas(id, user.empresaId, di, df)

    if (result.success) {
      revalidatePath(`/pesquisas/${id}`)
      revalidatePath('/pesquisas')
    }
    
    return result
  } catch (error: any) {
    console.error("[ERRO ATUALIZAR DATAS ACTION]", error)
    return errorResponse("Erro ao atualizar datas", "INTERNAL_ERROR")
  }
}
