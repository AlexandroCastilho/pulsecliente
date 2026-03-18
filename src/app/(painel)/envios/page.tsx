import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { EnviosWizard } from '@/components/EnviosWizard'
import { EnviosDashboard } from '@/components/EnviosDashboard'
import { getHistoricoEnvios, getStatsEnvios } from '@/actions/envios'

export default async function EnviosPage(props: { searchParams: Promise<{ pesquisaId?: string }> }) {
  const searchParams = await props.searchParams
  const pesquisaId = searchParams.pesquisaId

  if (pesquisaId) {
    return (
      <div className="p-8">
        <EnviosWizard pesquisaId={pesquisaId} />
      </div>
    )
  }

  // Busca dados para o Dashboard
  const [historico, stats] = await Promise.all([
    getHistoricoEnvios(),
    getStatsEnvios()
  ])

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Envios</h1>
          <p className="text-gray-500 font-medium">Acompanhe o status e histórico de todos os seus disparos.</p>
        </div>
      </div>

      <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>}>
        <EnviosDashboard historico={historico} stats={stats} />
      </Suspense>
    </div>
  )
}
