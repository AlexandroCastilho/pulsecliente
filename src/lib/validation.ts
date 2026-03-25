/**
 * Utilitário centralizado para validação de políticas de senha.
 * Focado em segurança defensiva e UX clara.
 */

export type PasswordValidationResult = {
  isValid: boolean
  message?: string
}

/** Lista básica de senhas muito comuns/fracas para bloqueio imediato */
const WEAK_TERMS = [
  'password', 'senha123', 'qwerty', 'admin123', 'brasil123', '123456', 'pulse7'
]

export function validatePassword(password: string): PasswordValidationResult {
  const normalized = password.toLowerCase()

  // 1. Comprimento Mínimo (Hardening para 8+)
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'A senha deve possuir pelo menos 8 caracteres.'
    }
  }

  // 2. Bloqueio de termos proibidos (Blacklist dinâmica)
  // Bloqueamos se a senha for IGUAL a um termo fraco ou se o termo fraco for a base (ex: password123)
  const isWeak = WEAK_TERMS.some(term => normalized === term || normalized.startsWith(term))
  if (isWeak) {
    return {
      isValid: false,
      message: 'Esta senha é muito comum ou baseada em termos previsíveis. Escolha algo mais criativo.'
    }
  }

  // 3. Complexidade Básica (Combinação de tipos)
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra e um número.'
    }
  }

  // 4. Bloqueio de Sequências Óbvias (Ex: 111111, aaaaaa)
  const isSequence = /^(.)\1+$/.test(password)
  if (isSequence) {
    return {
      isValid: false,
      message: 'Sua senha não pode consistir em caracteres repetidos.'
    }
  }

  return { isValid: true }
}
