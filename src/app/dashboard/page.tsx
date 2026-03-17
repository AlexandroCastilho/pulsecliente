import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">PulseCliente</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<PieChart size={20} />} label="Pesquisas" />
          <NavItem icon={<Send size={20} />} label="Envios" />
          <NavItem icon={<Users size={20} />} label="Clientes" />
          <NavItem icon={<Mail size={20} />} label="Comunicações" />
          <NavItem icon={<Settings size={20} />} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold border-2 border-slate-700">
              {dbUser.nome.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">{dbUser.nome}</span>
              <span className="text-xs text-slate-400 truncate">{dbUser.empresa.nome}</span>
            </div>
          </div>
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group">
              <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 font-medium">Bem-vindo de volta, {dbUser.nome.split(' ')[0]}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95">
              <Plus size={20} />
              Nova Pesquisa
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="NPS Geral" 
              value="72" 
              trend="+4.2%" 
              subtext="Zona de Qualidade"
              icon={<TrendingUp className="text-emerald-500" size={24} />}
            />
            <MetricCard 
              label="Taxa de Resposta" 
              value="64.5%" 
              trend="+12%" 
              subtext="2.4k respostas este mês"
              icon={<MessageSquare className="text-indigo-500" size={24} />}
            />
            <MetricCard 
              label="Total de Disparos" 
              value="3,842" 
              trend="+18%" 
              subtext="Crescimento constante"
              icon={<Send className="text-blue-500" size={24} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Surveys */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Pesquisas Recentes</h3>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Ver todas</button>
              </div>
              <div className="divide-y divide-gray-100">
                <SurveyRow 
                  title="Satisfação do Cliente Q1" 
                  date="Há 2 dias" 
                  responses={156} 
                  status="Ativa" 
                />
                <SurveyRow 
                  title="Feedback de Novo Onboarding" 
                  date="Há 5 dias" 
                  responses={42} 
                  status="Ativa" 
                />
                <SurveyRow 
                  title="Pesquisa de Clima Organizacional" 
                  date="Há 1 semana" 
                  responses={89} 
                  status="Finalizada" 
                />
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
        </main>
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

function SurveyRow({ title, date, responses, status }: any) {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
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
