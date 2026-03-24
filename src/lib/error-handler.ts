export function sanitizeErrorMessage(error: any): string {
  console.error("[FULL ERROR LOG]", error)

  const message = typeof error === 'string' 
    ? error 
    : error?.message || "Ocorreu um erro inesperado."
  
  const lowerMessage = message.toLowerCase()

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
    ['failed to fetch', 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.'],
    ['network request failed', 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.'],
  ]

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

  const matchedTranslation = knownTranslations.find(([pattern]) => lowerMessage.includes(pattern))
  if (matchedTranslation) {
    return matchedTranslation[1]
  }

  return message
}
