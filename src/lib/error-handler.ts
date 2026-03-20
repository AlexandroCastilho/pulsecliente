export function sanitizeErrorMessage(error: any): string {
  console.error("[FULL ERROR LOG]", error)

  // Erros conhecidos do Prisma / Banco
  if (error?.code === 'P2002') {
    const target = error?.meta?.target || []
    if (target.includes('email')) {
      return "Este e-mail já está cadastrado. Tente fazer login."
    }
    return "Já existe um registro com estes dados."
  }

  if (error?.code?.startsWith('P')) {
    return "Ocorreu um erro de banco de dados. Por favor, tente novamente mais tarde."
  }

  // Erros de autenticação
  if (error?.message?.toLowerCase().includes('permissão') || error?.message?.toLowerCase().includes('not allowed')) {
    return "Acesso negado. Você não tem permissão para realizar esta ação."
  }

  // Erros genéricos de conexão
  if (error?.message?.toLowerCase().includes('fetch') || error?.message?.toLowerCase().includes('network')) {
    return "Erro de conexão com o servidor. Verifique sua internet."
  }

  // Erro de rate limit (muitos pedidos)
  if (error?.message?.toLowerCase().includes('rate limit')) {
    return "Muitas solicitações enviadas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente."
  }

  // Se for uma string simples (nossa própria throw Error)
  if (typeof error === 'string') return error
  if (error instanceof Error && !error.message.includes('Prisma')) return error.message

  return "Ocorreu um erro inesperado. Nossa equipe técnica já foi notificada."
}
