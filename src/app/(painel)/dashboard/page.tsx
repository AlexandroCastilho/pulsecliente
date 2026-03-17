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
  Activity
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { calculateNPS, formatPercent } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Lógica de Bootstrap: Buscar ou criar usuário no Prisma
  let dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { empresa: true }
  })

  if (!dbUser) {
    // Criar empresa padrão
    const empresa = await prisma.empresa.create({
      data: {
        nome: "Minha Empresa",
        slug: `minha-empresa-${Date.now()}`
      }
    })

    // Criar usuário como OWNER
    dbUser = await prisma.usuario.create({
      data: {
        id: user.id,
        email: user.email!,
        nome: user.user_metadata.full_name || "Admin",
        role: "OWNER",
        empresaId: empresa.id
      },
      include: { empresa: true }
    })
  }

  // 1. Buscar pesquisas reais para listar
  const pesquisas = await prisma.pesquisa.findMany({
    where: { empresaId: dbUser.empresaId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { envios: { where: { status: 'RESPONDIDO' } } }
      }
    },
    take: 5
  })

  // 2. Buscar métricas globais de envios
  const totalEnvios = await prisma.envio.count({
    where: { pesquisa: { empresaId: dbUser.empresaId } }
  })

  const totalRespondidos = await prisma.envio.count({
    where: { 
      pesquisa: { empresaId: dbUser.empresaId },
      status: 'RESPONDIDO'
    }
  })

  const taxaResposta = totalEnvios > 0 ? (totalRespondidos / totalEnvios) * 100 : 0

  // 3. Calcular NPS Geral (Média de todas as pesquisas da empresa)
  // Buscamos todas as respostas de perguntas do tipo ESCALA_NPS vinculadas à empresa
  const respostasNPS = await prisma.resposta.findMany({
    where: {
      envio: {
        pesquisa: { empresaId: dbUser.empresaId }
      }
      // Opcional: filtrar apenas dados que são números se necessário, 
      // mas vamos assumir que o tipo ESCALA_NPS no editor garante isso
    },
    select: { dados: true }
  })

  // Extrair as notas de NPS do JSON de respostas
  const notasNPS: number[] = []
  respostasNPS.forEach(r => {
    const dados = r.dados as Record<string, any>
    // Iteramos sobre as chaves (IDs das perguntas) para achar valores numéricos
    Object.values(dados).forEach(val => {
      if (typeof val === 'number') notasNPS.push(val)
    })
  })

  const npsGeral = calculateNPS(notasNPS)
  const npsLabel = notasNPS.length > 0 ? npsGeral.toString() : '--'

  return (
    <div className="space-y-8">
      {/* Welcome Header (Local) */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium">Bem-vindo de volta, {dbUser.nome.split(' ')[0]}!</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="NPS Geral" 
          value={npsLabel} 
          trend="Equilibrado" 
          subtext={`${notasNPS.length} avaliações recebidas`}
          icon={<TrendingUp className="text-emerald-500" size={24} />}
        />
        <MetricCard 
          label="Taxa de Resposta" 
          value={formatPercent(taxaResposta)} 
          trend="Real" 
          subtext={`${totalRespondidos} de ${totalEnvios} envios`}
          icon={<MessageSquare className="text-indigo-500" size={24} />}
        />
        <MetricCard 
          label="Total de Disparos" 
          value={totalEnvios.toString()} 
          trend="Total" 
          subtext="Histórico acumulado"
          icon={<Send className="text-blue-500" size={24} />}
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
            <StatusItem label="E-mails Enviados" percentage={85} color="bg-indigo-600" />
            <StatusItem label="Pesquisas Respondidas" percentage={62} color="bg-emerald-500" />
            <StatusItem label="Taxa de Abertura" percentage={92} color="bg-blue-500" />
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

function MetricCard({ label, value, trend, subtext, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-500 mb-1">{label}</h4>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
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
