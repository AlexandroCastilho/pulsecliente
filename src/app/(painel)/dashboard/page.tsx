import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Settings, 
  Mail, 
  PieChart, 
  Plus, 
  Bell, 
  LogOut,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { calculateNPS, formatPercent } from '@/lib/utils'
import { criarNotificacao } from '@/actions/notifications'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar o dbUser (agora garantido pelo layout, mas precisamos dele aqui para o ID da empresa)
  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true, nome: true }
  })

  if (!dbUser) redirect('/login')

  // 1. Buscar métricas consolidadas (Otimização de Performance)
  // Substituímos múltiplos prisma.count() por queries mais eficientes
  const statusStats = await prisma.envio.groupBy({
    by: ['status'],
    where: { pesquisa: { empresaId: dbUser.empresaId } },
    _count: { _all: true }
  })

  const getS = (s: string) => statusStats.find(x => x.status === s)?._count._all || 0
  
  const respondidas = getS('RESPONDIDO')
  const aResponder = getS('ENVIADO')
  const finalizadas = respondidas + getS('EXPIRADO')
  const totalEnvios = statusStats.reduce((acc, curr) => acc + curr._count._all, 0)
  
  // Contagem de clientes únicos (Mantida separada por ser groupBy diferente)
  const alcanceGroup = await prisma.envio.groupBy({
    by: ['emailDestinatario'],
    where: { pesquisa: { empresaId: dbUser.empresaId } },
  })
  const clientesAlcancados = alcanceGroup.length

  const taxaResposta = totalEnvios > 0 ? (respondidas / totalEnvios) * 100 : 0
  
  const countEnviados = respondidas + aResponder + getS('EXPIRADO')
  const countErros = getS('ERRO')
  
  const percEnviados = totalEnvios > 0 ? Math.round((countEnviados / totalEnvios) * 100) : 0
  const percRespondidos = totalEnvios > 0 ? Math.round((respondidas / totalEnvios) * 100) : 0
  const percSucesso = totalEnvios > 0 ? Math.round(((totalEnvios - countErros) / totalEnvios) * 100) : 0

  // 2. Buscar pesquisas recentes (Lista)
  const pesquisas = await prisma.pesquisa.findMany({
    where: { empresaId: dbUser.empresaId },
    select: {
      id: true,
      titulo: true,
      createdAt: true,
      _count: {
        select: { envios: { where: { status: 'RESPONDIDO' } } }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  
  // 3. Calcular NPS Global (Agregado de todas as pesquisas)
  const todasRespostas = await prisma.resposta.findMany({
    where: { 
      envio: { 
        pesquisa: { empresaId: dbUser.empresaId } 
      } 
    },
    include: {
      envio: {
        include: {
          pesquisa: {
            include: { perguntas: { where: { tipo: 'ESCALA_NPS' } } }
          }
        }
      }
    }
  })

  const notasNPSGlobal: number[] = []
  todasRespostas.forEach(r => {
    const dados = r.dados as Record<string, any>
    const npsPerguntas = r.envio.pesquisa.perguntas
    npsPerguntas.forEach(p => {
      if (typeof dados[p.id] === 'number') {
        notasNPSGlobal.push(dados[p.id])
      }
    })
  })

  const globalNpsScore = calculateNPS(notasNPSGlobal)

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header (Local) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard de Operações</h1>
          <p className="text-sm text-gray-500 font-medium">Bem-vindo de volta, {dbUser.nome.split(' ')[0]}! Veja o desempenho dos seus disparos.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
          <Activity size={18} className="text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest whitespace-nowrap">Status Geral</span>
        </div>
      </div>

      {/* Metrics Grid - 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          label="NPS Agregado" 
          value={notasNPSGlobal.length > 0 ? globalNpsScore.toString() : '--'} 
          trend="Qualidade" 
          subtext="Média de todas as pesquisas"
          icon={<TrendingUp className={notasNPSGlobal.length > 0 && globalNpsScore < 0 ? "text-red-500" : "text-emerald-500"} size={24} />}
          color={notasNPSGlobal.length > 0 && globalNpsScore < 0 ? "text-red-600" : undefined}
          tooltip={notasNPSGlobal.length > 0 && globalNpsScore < 0 ? "O score global é negativo. Mais detratores que promotores no geral." : undefined}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Surveys */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Pesquisas Recentes</h3>
            <Link href="/pesquisas" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pesquisas.length > 0 ? (
              pesquisas.map((p) => (
                <SurveyRow 
                  key={p.id}
                  id={p.id}
                  title={p.titulo} 
                  date={new Date(p.createdAt).toLocaleDateString('pt-BR')} 
                  responses={p._count.envios} 
                  status="Ativa" 
                />
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-400 text-sm font-medium">Nenhuma pesquisa criada ainda.</p>
                <Link href="/editor" className="text-indigo-600 text-xs font-bold mt-2 inline-block hover:underline">
                  Criar minha primeira pesquisa
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Dispatch Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Status dos Disparos</h3>
          <div className="space-y-6">
            <StatusItem label="E-mails Enviados" percentage={percEnviados} color="bg-indigo-600" />
            <StatusItem label="Pesquisas Respondidas" percentage={percRespondidos} color="bg-emerald-500" />
            <StatusItem label="Taxa de Entrega" percentage={percSucesso} color="bg-blue-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Subcomponentes
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}>
      {icon}
      {label}
    </button>
  )
}

function MetricCard({ label, value, trend, subtext, icon, color, tooltip }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${color ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
          {label}
          {tooltip && (
            <div className="group/tip relative inline-block">
              <AlertCircle size={10} className="text-red-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 font-medium text-center shadow-xl normal-case tracking-normal">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          )}
        </h4>
        <div className={`text-3xl font-bold tracking-tight ${color || 'text-gray-900'}`}>{value}</div>
        <p className="mt-2 text-xs font-medium text-gray-400 italic">{subtext}</p>
      </div>
    </div>
  )
}

function SurveyRow({ id, title, date, responses, status }: any) {
  return (
    <Link href={`/pesquisas/${id}`} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
          <MessageSquare size={18} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500 font-medium">{date} • {responses} respostas</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
          status === 'Ativa' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
        }`}>
          {status}
        </span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transform group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
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
