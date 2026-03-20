import prisma from '@/lib/prisma'

export async function DispatchStatus({ empresaId }: { empresaId: string }) {
  const statusStats = await prisma.envio.groupBy({
    by: ['status'],
    where: { pesquisa: { empresaId } },
    _count: { _all: true }
  })

  const getS = (s: string) => statusStats.find(x => x.status === s)?._count._all || 0
  const respondidas = getS('RESPONDIDO')
  const aResponder = getS('ENVIADO')
  const totalEnvios = statusStats.reduce((acc, curr) => acc + curr._count._all, 0)
  const countEnviados = respondidas + aResponder + getS('EXPIRADO')
  const countErros = getS('ERRO')

  const percEnviados = totalEnvios > 0 ? Math.round((countEnviados / totalEnvios) * 100) : 0
  const percRespondidos = totalEnvios > 0 ? Math.round((respondidas / totalEnvios) * 100) : 0
  const percSucesso = totalEnvios > 0 ? Math.round(((totalEnvios - countErros) / totalEnvios) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-bold text-gray-900 mb-6">Status dos Disparos</h3>
      <div className="space-y-6">
        <StatusItem label="E-mails Enviados" percentage={percEnviados} color="bg-indigo-600" />
        <StatusItem label="Pesquisas Respondidas" percentage={percRespondidos} color="bg-emerald-500" />
        <StatusItem label="Taxa de Entrega" percentage={percSucesso} color="bg-blue-500" />
      </div>
    </div>
  )
}

function StatusItem({ label, percentage, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-bold text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export function DispatchSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-4 bg-gray-100 rounded w-10"></div>
            </div>
            <div className="h-3 bg-gray-50 rounded-full w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
