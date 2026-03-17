/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata uma porcentagem com uma casa decimal
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Calcula o Score NPS baseado nas notas
 * NPS = % Promotores (9-10) - % Detratores (0-6)
 */
export function calculateNPS(notas: number[]): number {
  if (notas.length === 0) return 0
  
  const promotores = notas.filter(n => n >= 9).length
  const detratores = notas.filter(n => n <= 6).length
  
  const percentPromotores = (promotores / notas.length) * 100
  const percentDetratores = (detratores / notas.length) * 100
  
  return Math.round(percentPromotores - percentDetratores)
}

/**
 * Retorna a cor correspondente à nota NPS
 */
export function getNPSColor(nota: number): string {
  if (nota >= 9) return 'text-emerald-600 bg-emerald-50 border-emerald-100' // Promotor
  if (nota >= 7) return 'text-amber-600 bg-amber-50 border-amber-100'    // Neutro
  return 'text-red-600 bg-red-50 border-red-100'                         // Detrator
}
