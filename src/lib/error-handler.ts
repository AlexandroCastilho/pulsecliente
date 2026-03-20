export function sanitizeErrorMessage(error: any): string {
  console.error("[FULL ERROR LOG]", error)

  const message = typeof error === 'string' 
    ? error 
    : error?.message || "Ocorreu um erro inesperado."
  
  const lowerMessage = message.toLowerCase()

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

  // Erro de rate limit (muitos pedidos)
  if (lowerMessage.includes('rate limit')) {
    return "Muitas solicitações enviadas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente."
  }

  // Erros de autenticação
  if (lowerMessage.includes('permissão') || lowerMessage.includes('not allowed')) {
    return "Acesso negado. Você não tem permissão para realizar esta ação."
  }

  // Erros genéricos de conexão
  if (lowerMessage.includes('fetch') || lowerMessage.includes('network')) {
    return "Erro de conexão com o servidor. Verifique sua internet."
  }

  return message
}
