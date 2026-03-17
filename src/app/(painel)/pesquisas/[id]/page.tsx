import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  CheckCircle2, 
  Clock,
  MessageSquare,
  BarChart3,
  User,
  ChevronRight,
  Star,
  AlertCircle
} from 'lucide-react'
import { formatDate, calculateNPS, getNPSColor } from '@/lib/utils'
import { DeleteSurveyButton } from '@/components/DeleteSurveyButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PesquisaDetalhesPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Buscar a pesquisa e validar acesso (empresaId)
  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  })

  const pesquisa = await prisma.pesquisa.findFirst({
    where: { 
      id,
      empresaId: dbUser?.empresaId 
    },
    include: {
      envios: {
        orderBy: { createdAt: 'desc' },
        include: {
          resposta: true
        }
      },
      perguntas: true
    }
  })

  if (!pesquisa) notFound()

  // 2. Calcular Métricas
  const totalEnvios = pesquisa.envios.length
  const totalRespondidos = pesquisa.envios.filter(e => e.status === 'RESPONDIDO').length
  const totalPendentes = totalEnvios - totalRespondidos
  const taxaResposta = totalEnvios > 0 ? (totalRespondidos / totalEnvios) * 100 : 0

  // 3. Calcular NPS da Pesquisa Específica
  const notasNPS: number[] = []
  pesquisa.envios.forEach(e => {
    if (e.resposta) {
      const dados = e.resposta.dados as Record<string, any>
      Object.values(dados).forEach(val => {
        if (typeof val === 'number') notasNPS.push(val)
      })
    }
  })

  const npsScore = calculateNPS(notasNPS)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/pesquisas"
            className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-xl transition-all text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pesquisa.titulo}</h1>
            <p className="text-sm text-gray-500 font-medium">Resultados e análise de engajamento</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-emerald-500`} />
            <span className="text-sm font-bold text-gray-700">Ativa</span>
          </div>
          <DeleteSurveyButton surveyId={pesquisa.id} surveyTitle={pesquisa.titulo} redirectToList variant="full" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard 
          label="NPS Score" 
          value={notasNPS.length > 0 ? npsScore.toString() : '--'} 
          icon={<BarChart3 size={18} />}
          color="text-indigo-600 bg-indigo-50"
        />
        <MiniStatCard 
          label="Respondidos" 
          value={totalRespondidos.toString()} 
          icon={<CheckCircle2 size={18} />}
          color="text-emerald-600 bg-emerald-50"
        />
        <MiniStatCard 
          label="Pendentes" 
          value={totalPendentes.toString()} 
          icon={<Clock size={18} />}
          color="text-amber-600 bg-amber-50"
        />
        <MiniStatCard 
          label="Taxa de Resposta" 
          value={`${taxaResposta.toFixed(1)}%`} 
          icon={<Users size={18} />}
          color="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Tabela de Clientes e Respostas */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Respostas Individuais</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{pesquisa.envios.length} Envios Totais</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Nota NPS</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pesquisa.envios.map((envio) => {
                // Tenta extrair a nota NPS se existir resposta
                let notaNps: number | null = null
                if (envio.resposta) {
                  const dados = envio.resposta.dados as Record<string, any>
                  Object.values(dados).forEach(v => {
                    if (typeof v === 'number') notaNps = v
                  })
                }

                return (
                  <tr key={envio.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-50">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 leading-none mb-1">{envio.nomeDestinatario}</div>
                          <div className="text-xs text-gray-400 font-medium">{envio.emailDestinatario}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center text-sm font-medium text-gray-500">
                      {formatDate(envio.enviadoEm || envio.createdAt)}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border flex items-center gap-1.5 ${
                          envio.status === 'RESPONDIDO' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : envio.status === 'PROCESSANDO'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : envio.status === 'ERRO'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {envio.status === 'PROCESSANDO' && (
                            <div className="w-2 h-2 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                          )}
                          {envio.status}
                        </span>
                        
                        {envio.status === 'ERRO' && envio.erroLog && (
                          <div 
                            className="flex items-center gap-1 text-[9px] text-red-400 font-bold cursor-help bg-red-50/50 px-1.5 py-0.5 rounded shadow-sm hover:bg-red-100 transition-colors"
                            title={envio.erroLog}
                          >
                            <AlertCircle size={10} />
                            Ver Erro
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      {notaNps !== null ? (
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold border-2 transition-transform group-hover:scale-110 ${getNPSColor(notaNps)}`}>
                          {notaNps}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs font-medium italic">Sem nota</span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {pesquisa.envios.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Mail size={32} />
              </div>
              <p className="text-gray-400 font-medium">Nenhum envio realizado para esta pesquisa.</p>
              <Link 
                href={`/envios?pesquisaId=${pesquisa.id}`}
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Configurar disparos agora
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  )
}
