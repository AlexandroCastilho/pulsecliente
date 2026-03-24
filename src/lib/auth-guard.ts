import prisma from "./prisma"
import { createClient } from "./supabase/server"
import { Role } from "@prisma/client"

export type AuthenticatedUser = {
  id: string
  email: string
  nome: string
  role: Role
  empresaId: string
}

/**
 * Valida a sessão do Supabase e o perfil do usuário no Prisma.
 * Garante que o usuário pertence a uma empresa e está ativo.
 * 
 * @param requiredRoles (Opcional) Lista de roles permitidas para a ação.
 * @returns Dados do usuário autenticado e validados.
 * @throws Error com mensagem amigável se a validação falhar.
 */
export async function getAuthenticatedUser(requiredRoles?: Role[]): Promise<AuthenticatedUser> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Sessão expirada ou inválida. Por favor, faça login novamente.")
  }

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      nome: true,
      role: true,
      empresaId: true,
      ativo: true,
    }
  })

  if (!dbUser) {
    throw new Error("Perfil de usuário não encontrado no sistema.")
  }

  if (!dbUser.ativo) {
    throw new Error("Sua conta está desativada. Entre em contato com o administrador.")
  }

  if (!dbUser.empresaId) {
    throw new Error("Usuário não está vinculado a nenhuma empresa.")
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(dbUser.role)) {
      throw new Error("Você não tem permissão para realizar esta ação.")
    }
  }

  return dbUser as AuthenticatedUser
}

/**
 * Higher-Order Function que encapsula a autenticação de Server Actions.
 * Elimina a repetição de `getAuthenticatedUser` em cada action.
 *
 * @example
 * export async function minhaAction(input: MeuInput) {
 *   return authAction(input, ['ADMIN'], async (data, user) => {
 *     // user é AuthenticatedUser já validado
 *     return await fazAlgo(data, user.empresaId)
 *   })
 * }
 *
 * @param input Dados de entrada da action.
 * @param requiredRoles Roles obrigatórias (undefined = qualquer usuário autenticado).
 * @param handler Função executada com o usuário validado injetado.
 */
export async function authAction<TInput, TOutput>(
  input: TInput,
  requiredRoles: Role[] | undefined,
  handler: (input: TInput, user: AuthenticatedUser) => Promise<TOutput>
): Promise<TOutput> {
  const user = await getAuthenticatedUser(requiredRoles)
  return handler(input, user)
}

/**
 * Valida se um recurso específico pertence à empresa do usuário autenticado.
 * 
 * @param resourceId ID do recurso (ex: ID da Pesquisa, ID do Envio).
 * @param model Modelo do Prisma com suporte a findFirst.
 * @param user Usuário autenticado (retornado por getAuthenticatedUser).
 * @returns O recurso encontrado se pertencer à empresa.
 * @throws Error se o recurso não existir ou pertencer a outra empresa.
 */
export async function ensureResourceOwnership<T>(
  resourceId: string,
  model: { findFirst: (args: { where: Record<string, unknown> }) => Promise<T | null> },
  user: AuthenticatedUser
): Promise<T> {
  const resource = await model.findFirst({
    where: {
      id: resourceId,
      empresaId: user.empresaId
    }
  })

  if (!resource) {
    throw new Error("Recurso não encontrado ou você não tem permissão para acessá-lo.")
  }

  return resource
}
