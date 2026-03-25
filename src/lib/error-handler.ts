type ErrorContext = {
  userId?: string
  empresaId?: string
  actionName?: string
}

/**
 * Loga erros de forma estruturada (JSON) para rastreamento rápido em produção.
 * Use esta função em blocos catch das Server Actions e rotas de API.
 *
 * @example
 * } catch (error) {
 *   logStructuredError(error, { userId: user.id, empresaId: user.empresaId, actionName: 'salvarPesquisa' })
 * }
 */
export function logStructuredError(error: unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorCode = (error as Record<string, unknown>)?.code ?? undefined

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    actionName: context?.actionName ?? 'unknown',
    userId: context?.userId ?? null,
    empresaId: context?.empresaId ?? null,
    error: errorMessage,
    code: errorCode ?? null,
  }))
}

export function sanitizeErrorMessage(error: unknown, options: { strict?: boolean } = {}): string {
  // Log estruturado sempre ocorre internamente para depuração
  logStructuredError(error)

  const rawMessage = typeof error === 'string'
    ? error
    : (error as Record<string, unknown>)?.message as string || "Ocorreu um erro inesperado."

  const lowerMessage = rawMessage.toLowerCase()

  const knownTranslations: Array<[string, string]> = [
    ['invalid login credentials', 'Credenciais de login inválidas.'],
    ['email not confirmed', 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.'],
    ['user already registered', 'Este e-mail já está cadastrado. Tente fazer login.'],
    ['already registered', 'Este e-mail já está cadastrado. Tente fazer login.'],
    ['invalid email', 'E-mail inválido.'],
    ['unable to validate email address', 'Não foi possível validar o endereço de e-mail informado.'],
    ['email address is invalid', 'O endereço de e-mail informado é inválido.'],
    ['password should be at least 6 characters', 'A senha deve ter pelo menos 6 caracteres.'],
    ['password should be at least', 'A senha informada não atende ao tamanho mínimo exigido.'],
    ['signup is disabled', 'O cadastro de novas contas está desativado no momento.'],
    ['email rate limit exceeded', 'Muitas tentativas envolvendo e-mail. Aguarde alguns minutos antes de tentar novamente.'],
    ['too many requests', 'Muitas solicitações em pouco tempo. Aguarde alguns minutos antes de tentar novamente.'],
    ['otp expired', 'O link enviado expirou. Solicite um novo link e tente novamente.'],
    ['token has expired or is invalid', 'O link informado expirou ou é inválido. Solicite um novo e-mail e tente novamente.'],
    ['invalid or expired', 'O link informado expirou ou é inválido. Solicite um novo e-mail e tente novamente.'],
    ['refresh token not found', 'Sua sessão expirou. Faça login novamente.'],
    ['jwt expired', 'Sua sessão expirou. Faça login novamente.'],
    ['permission denied', 'Acesso negado. Você não tem permissão para realizar esta ação.'],
    ['not allowed', 'Acesso negado. Você não tem permissão para realizar esta ação.'],
    ['duplicate key value violates unique constraint', 'Já existe um registro com esses dados.'],
    ['row-level security', 'Você não tem permissão para acessar este recurso.'],
    ['failed to fetch', 'Erro de conexão com o servidor. Verifique sua internet.'],
    ['network request failed', 'Erro de conexão com o servidor. Verifique sua internet.'],
    ['rejeitado pelas políticas de segurança', 'Rejeitado por políticas de segurança. Verifique o SMTP.'],
  ]

  // Erros conhecidos do Prisma / Banco
  const prismaError = error as Record<string, unknown>
  if (prismaError?.code === 'P2002') {
    const target = prismaError?.meta as Record<string, unknown>
    if ((target?.target as string[])?.includes('email')) {
      return "Este e-mail já está cadastrado."
    }
    return "Já existe um registro com estes dados."
  }

  // Se for erro do Prisma (começa com P), retorna mensagem genérica para não vazar schema
  if (typeof prismaError?.code === 'string' && prismaError.code.startsWith('P')) {
    return "Erro de integridade de dados. A operação não pôde ser concluída."
  }

  // Tradução direta se houver match
  const matchedTranslation = knownTranslations.find(([pattern]) => lowerMessage.includes(pattern))
  if (matchedTranslation) {
    return matchedTranslation[1]
  }

  // Erros de rate limit ou permissão em português (já lançados customizados)
  if (lowerMessage.includes('rate limit')) return "Muitas solicitações. Aguarde um momento."
  if (lowerMessage.includes('permissão') || lowerMessage.includes('autorizado')) return "Acesso negado."

  // REGRA DE HARDENING: No modo strict, não retorna a mensagem original se não for conhecida
  if (options.strict) {
    return "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde."
  }

  return rawMessage
}
