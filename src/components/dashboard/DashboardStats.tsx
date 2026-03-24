import prisma from '@/lib/prisma'
import { MessageSquare, Clock, CheckCircle2, Send, Users, TrendingUp } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { formatPercent } from '@/lib/utils'

export async function DashboardStats({ empresaId }: { empresaId: string }) {
  const [statusStats, alcanceGroup] = await Promise.all([
    prisma.envio.groupBy({
      by: ['status'],
      where: { pesquisa: { empresaId } },
      _count: { _all: true }
    }),
    prisma.envio.groupBy({
      by: ['emailDestinatario'],
      where: { pesquisa: { empresaId } },
    })
  ])

  const getS = (s: string) => statusStats.find(x => x.status === s)?._count._all || 0
  
  const respondidas = getS('RESPONDIDO')
  const aResponder = getS('ENVIADO')
  const finalizadas = respondidas + getS('EXPIRADO')
  const totalEnvios = statusStats.reduce((acc, curr) => acc + curr._count._all, 0)
  
  const clientesAlcancados = alcanceGroup.length
  const taxaResposta = totalEnvios > 0 ? (respondidas / totalEnvios) * 100 : 0

  return (
    <>
      <MetricCard 
        label="Pesquisas Respondidas" 
        value={respondidas.toString()} 
        trend="Feedback" 
        subtext="Total de respostas recebidas"
        icon={<MessageSquare className="text-emerald-500" size={24} />}
      />
      <MetricCard 
        label="A Responder" 
        value={aResponder.toString()} 
        trend="Pendente" 
        subtext="Aguardando abertura/resposta"
        icon={<Clock className="text-amber-500" size={24} />}
      />
      <MetricCard 
        label="Finalizadas" 
        value={finalizadas.toString()} 
        trend="Concluído" 
        subtext="Participações encerradas"
        icon={<CheckCircle2 className="text-indigo-500" size={24} />}
      />
      <MetricCard 
        label="Taxa de Respostas" 
        value={formatPercent(taxaResposta)} 
        trend="Conversão" 
        subtext="Engajamento dos clientes"
        icon={<TrendingUp className="text-blue-500" size={24} />}
      />
      <MetricCard 
        label="Quantidade de Disparos" 
        value={totalEnvios.toString()} 
        trend="Volume" 
        subtext="Total de e-mails enviados"
        icon={<Send className="text-slate-500" size={24} />}
      />
      <MetricCard 
        label="Clientes Alcançados" 
        value={clientesAlcancados.toString()} 
        trend="Alcance" 
        subtext="Contatos únicos atingidos"
        icon={<Users className="text-purple-500" size={24} />}
      />
    </>
  )
}

export function StatsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
            <div className="w-16 h-5 bg-gray-50 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-50 rounded w-1/2"></div>
            <div className="h-8 bg-gray-100 rounded w-3/4"></div>
            <div className="h-3 bg-gray-50 rounded w-full"></div>
          </div>
        </div>
      ))}
    </>
  )
}
