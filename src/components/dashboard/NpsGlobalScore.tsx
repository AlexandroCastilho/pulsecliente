import { PesquisaService } from '@/services/pesquisa.service'
import { TrendingUp } from 'lucide-react'
import { MetricCard } from './MetricCard'

export async function NpsGlobalScore({ empresaId }: { empresaId: string }) {
  const result = await PesquisaService.getGlobalNPS(empresaId)

  if (!result.success) {
    return (
      <MetricCard 
        label="NPS Agregado" 
        value="--" 
        trend="Erro" 
        subtext="Falha ao calcular NPS"
        icon={<TrendingUp className="text-gray-300" size={24} />}
      />
    )
  }

  const globalNpsScore = result.data

  return (
    <MetricCard 
      label="NPS Agregado" 
      value={(globalNpsScore !== null && globalNpsScore !== undefined) ? globalNpsScore.toString() : '--'} 
      trend="Qualidade" 
      subtext="Média de todas as pesquisas"
      icon={<TrendingUp className={(globalNpsScore !== null && globalNpsScore !== undefined) && globalNpsScore < 0 ? "text-red-500" : "text-emerald-500"} size={24} />}
      color={(globalNpsScore !== null && globalNpsScore !== undefined) && globalNpsScore < 0 ? "text-red-600" : undefined}
      tooltip={(globalNpsScore !== null && globalNpsScore !== undefined) && globalNpsScore < 0 ? "O score global é negativo. Mais detratores que promotores no geral." : undefined}
    />
  )
}
