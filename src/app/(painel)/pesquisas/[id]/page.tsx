import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Send,
  CheckCircle2, 
  Clock,
  MessageSquare,
  BarChart3,
  User,
  ChevronRight,
  Star,
  AlertCircle,
  TrendingUp,
  PieChart,
  List,
  Target
} from 'lucide-react'
import { formatDate, calculateNPS, getNPSColor } from '@/lib/utils'
import { DeleteSurveyButton } from '@/components/DeleteSurveyButton'
import { CopySurveyLink } from '@/components/CopySurveyLink'
import { SurveyResponseTable } from '@/components/SurveyResponseTable'
import SurveyDateHeader from '@/components/SurveyDateHeader'

interface PesquisaDates {
  dataInicio: Date | null
  dataFim: Date | null
}

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

  // 1. Buscar a pesquisa via select para evitar erro de colunas invisíveis no schema local
  const pesquisaBase = await prisma.pesquisa.findFirst({
    where: { 
      id,
      empresaId: dbUser?.empresaId 
    },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      ativa: true,
      createdAt: true,
      updatedAt: true,
      empresaId: true,
      envios: {
        orderBy: { createdAt: 'desc' },
        include: { resposta: true }
      },
      perguntas: {
        orderBy: { ordem: 'asc' }
      }
    }
  })

  if (!pesquisaBase) notFound()

  // Buscar as datas separadamente via SQL bruto para contornar o problema do Prisma Client
  const dates: PesquisaDates[] = await prisma.$queryRaw`
    SELECT "dataInicio", "dataFim" FROM pesquisas WHERE id = ${id}
  `
  
  const pesquisa = {
    ...pesquisaBase,
    dataInicio: dates[0]?.dataInicio || null,
    dataFim: dates[0]?.dataFim || null
  }

  if (!pesquisa) notFound()

  // 1. Métricas de Resumo
  const totalEnvios = pesquisa.envios.length
  const totalRespondidos = pesquisa.envios.filter(e => e.status === 'RESPONDIDO').length
  const taxaResposta = totalEnvios > 0 ? (totalRespondidos / totalEnvios) * 100 : 0

  // NPS Geral da Pesquisa
  const npsQuestionsIds = pesquisa.perguntas.filter(p => p.tipo === 'ESCALA_NPS').map(p => p.id)
  const notasNPS: number[] = []
  
  pesquisa.envios.forEach(e => {
    if (e.resposta) {
      const dados = e.resposta.dados as Record<string, any>
      npsQuestionsIds.forEach(qId => {
        if (typeof dados[qId] === 'number') notasNPS.push(dados[qId])
      })
    }
  })

  const npsScore = calculateNPS(notasNPS)

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/pesquisas"
            className="p-2.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-2xl transition-all text-gray-400 hover:text-gray-900 group"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <SurveyDateHeader 
              pesquisaId={pesquisa.id} 
              dataInicio={pesquisa.dataInicio} 
              dataFim={pesquisa.dataFim} 
              createdAt={pesquisa.createdAt} 
            />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{pesquisa.titulo}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href={`/pesquisas/${pesquisa.id}/envios`}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center gap-2.5 font-bold text-sm transition-all group"
          >
            <Send size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            <span>Monitorar / Novo Envio</span>
          </Link>
          {pesquisa.dataFim && new Date(pesquisa.dataFim) < new Date() ? (
            <div className="px-4 py-2.5 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2.5 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full bg-red-500`} />
              <span className="text-xs font-black uppercase tracking-wider">Finalizada</span>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-2.5 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse`} />
              <span className="text-xs font-black uppercase tracking-wider">{pesquisa.ativa ? 'Pesquisa Ativa' : 'Pesquisa Inativa'}</span>
            </div>
          )}
          <DeleteSurveyButton surveyId={pesquisa.id} surveyTitle={pesquisa.titulo} redirectToList variant="full" />
        </div>
      </div>

      {/* Camada 1: Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MiniStatCard 
          label="Total de Respostas" 
          value={totalRespondidos.toString()} 
          icon={<Users size={24} />}
          color="text-slate-600 bg-slate-50 border-slate-100"
          description={`${totalEnvios} envios totais`}
        />
        <MiniStatCard 
          label="NPS Score" 
          value={notasNPS.length > 0 ? npsScore.toString() : '--'} 
          icon={<Target size={24} />}
          color={notasNPS.length > 0 && npsScore < 0 ? "text-red-600 bg-red-50 border-red-100" : "text-indigo-600 bg-indigo-50 border-indigo-100"}
          description={notasNPS.length > 0 ? "Média de satisfação" : "Aguardando respostas"}
        />
        <MiniStatCard 
          label="Taxa de Conversão" 
          value={`${taxaResposta.toFixed(1)}%`} 
          icon={<TrendingUp size={24} />}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          description="Abertura x Resposta"
        />
      </div>

      {/* Camada 2: Visão por Pergunta */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
              <PieChart size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-none">Análise por Pergunta</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Desempenho quantitativo e qualitativo</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 flex-1 mx-8 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pesquisa.perguntas.map((pergunta, index) => (
            <QuestionAnalyticsCard 
              key={pergunta.id} 
              pergunta={pergunta} 
              index={index}
              envios={pesquisa.envios}
            />
          ))}
        </div>
      </div>

      {/* Camada 3: Tabela Detalhada */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-800/20">
            <List size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-none">Detalhamento Individual</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Visão completa por cliente e pergunta</p>
          </div>
        </div>
        
        <SurveyResponseTable 
          envios={pesquisa.envios} 
          perguntas={pesquisa.perguntas} 
        />
      </div>
    </div>
  )
}

interface EnvioComResposta {
  status: string
  resposta: { dados: Prisma.JsonValue } | null
}

interface PerguntaAnalytics {
  id: string
  titulo: string
  tipo: string
  opcoes: unknown
}

interface QuestionAnalyticsCardProps {
  pergunta: PerguntaAnalytics
  index: number
  envios: EnvioComResposta[]
}

function QuestionAnalyticsCard({ pergunta, index, envios }: QuestionAnalyticsCardProps) {
  const respostas = envios
    .filter((e: EnvioComResposta) => e.status === 'RESPONDIDO' && e.resposta)
    .map((e: EnvioComResposta) => (e.resposta!.dados as Record<string, unknown>)[pergunta.id])
    .filter((r: unknown) => r !== undefined && r !== null)

  const total = respostas.length

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:border-indigo-200 transition-colors group">
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pergunta {index + 1}</span>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{pergunta.titulo}</h3>
        </div>
        <div className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 border border-gray-100 shrink-0">
          {total} resps.
        </div>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-400">Nenhuma resposta disponível ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pergunta.tipo === 'MULTIPLA_ESCOLHA' && (
            <div className="space-y-4">
              {(pergunta.opcoes as string[]).map((opcao) => {
                const count = respostas.filter((r: any) => r === opcao).length
                const percent = (count / total) * 100
                return (
                  <div key={opcao} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-600">{opcao}</span>
                      <span className="text-indigo-600">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {pergunta.tipo === 'ESCALA_NPS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <NPSBreakdownItem 
                  label="Satisfeitos" 
                  count={respostas.filter((r: any) => Number(r) >= 9).length}
                  total={total}
                  color="bg-emerald-500"
                  sub="9-10"
                />
                <NPSBreakdownItem 
                  label="Neutros" 
                  count={respostas.filter((r: any) => Number(r) >= 7 && Number(r) <= 8).length}
                  total={total}
                  color="bg-amber-400"
                  sub="7-8"
                />
                <NPSBreakdownItem 
                  label="Insatisfeitos" 
                  count={respostas.filter((r: any) => Number(r) <= 6).length}
                  total={total}
                  color="bg-red-500"
                  sub="0-6"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NPS Score</span>
                  <span className={`text-2xl font-black ${calculateNPS(respostas.map(Number)) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {calculateNPS(respostas.map(Number))}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nota Média</span>
                  <span className="text-2xl font-black text-gray-700">
                    {(respostas.reduce((a: number, b: any) => a + Number(b), 0) / total).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                <p className="text-[10px] text-indigo-600/80 leading-relaxed font-bold uppercase tracking-wide">
                  O NPS varia de -100 a 100. Score negativo indica que há mais clientes insatisfeitos (detratores) que satisfeitos (promotores).
                </p>
              </div>
            </div>
          )}

          {pergunta.tipo === 'ESTRELAS' && (
            <div className="flex flex-col items-center py-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
              <span className="text-4xl font-black text-amber-500">
                {(respostas.reduce((a: number, b: any) => a + Number(b), 0) / total).toFixed(1)}
              </span>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s: number) => (
                  <Star 
                    key={s} 
                    size={20} 
                    className={s <= Math.round(respostas.reduce((a: number, b: any) => a + Number(b), 0) / total) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest mt-2">Média de Avaliação</span>
            </div>
          )}

          {pergunta.tipo === 'TEXTO_LIVRE' && (
            <div className="space-y-3">
              {respostas.slice(0, 3).map((resp: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl text-xs font-medium text-gray-600 border border-gray-100 italic">
                  &quot;{resp}&quot;
                </div>
              ))}
              {total > 3 && <p className="text-[10px] text-gray-400 text-center font-bold">Mais {total - 3} respostas ocultas</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface NPSBreakdownItemProps {
  label: string
  count: number
  total: number
  color: string
  sub: string
}

function NPSBreakdownItem({ label, count, total, color, sub }: NPSBreakdownItemProps) {
  const percent = (count / total) * 100
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full h-20 bg-gray-50 rounded-2xl relative overflow-hidden flex flex-col items-center justify-end pb-3">
        <div 
          className={`absolute bottom-0 w-full ${color} opacity-20 transition-all duration-700`} 
          style={{ height: `${percent}%` }}
        />
        <span className="text-lg font-black text-gray-900 relative z-10">{count}</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter relative z-10">{sub}</span>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none grow">{label}</p>
      </div>
      <span className="text-[9px] font-bold text-indigo-500">{percent.toFixed(0)}%</span>
    </div>
  )
}

interface MiniStatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  description: string
}

function MiniStatCard({ label, value, icon, color, description }: MiniStatCardProps) {
  return (
    <div className={`bg-white p-7 rounded-3xl border ${color.split(' ').pop()} shadow-sm hover:shadow-md transition-all group overflow-hidden relative`}>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
            {label}
          </p>
          <p className={`text-4xl font-black leading-none ${color.split(' ')[0]}`}>{value}</p>
        </div>
        <div className={`p-3.5 rounded-2xl ${color.split(' ').slice(1, 3).join(' ')} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="text-[11px] font-bold text-gray-400 mt-4 flex items-center gap-1.5 relative z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        {description}
      </div>
      {/* Decoração sutil */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-1000" />
    </div>
  )
}
