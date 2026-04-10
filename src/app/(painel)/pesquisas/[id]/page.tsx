import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Send,
  Star,
  TrendingUp,
  PieChart,
  List,
  Target
} from 'lucide-react'
import { calculateNPS } from '@/lib/utils'
import { DeleteSurveyButton } from '@/components/DeleteSurveyButton'
import { SurveyResponseTable } from '@/components/SurveyResponseTable'
import SurveyDateHeader from '@/components/SurveyDateHeader'

interface PesquisaDates {
  dataInicio: Date | null
  dataFim: Date | null
}

interface PageProps {
  params: Promise<{ id: string }>
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

function isRecord(value: Prisma.JsonValue): value is Record<string, Prisma.JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getRespostaValue(envio: EnvioComResposta, perguntaId: string): Prisma.JsonValue | null {
  if (!envio.resposta || !isRecord(envio.resposta.dados)) {
    return null
  }

  return envio.resposta.dados[perguntaId] ?? null
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function asNumber(value: Prisma.JsonValue): number | null {
  return typeof value === 'number' ? value : null
}

function getNumberResponses(respostas: Prisma.JsonValue[]): number[] {
  return respostas
    .map(asNumber)
    .filter((value): value is number => value !== null)
}

function getTextResponses(respostas: Prisma.JsonValue[]): string[] {
  return respostas.filter((value): value is string => typeof value === 'string')
}

export default async function PesquisaDetalhesPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  })

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

  const dates: PesquisaDates[] = await prisma.$queryRaw`
    SELECT "dataInicio", "dataFim" FROM pesquisas WHERE id = ${id}
  `

  const pesquisa = {
    ...pesquisaBase,
    dataInicio: dates[0]?.dataInicio || null,
    dataFim: dates[0]?.dataFim || null
  }

  const totalEnvios = pesquisa.envios.length
  const totalRespondidos = pesquisa.envios.filter((envio) => envio.status === 'RESPONDIDO').length
  const taxaResposta = totalEnvios > 0 ? (totalRespondidos / totalEnvios) * 100 : 0

  const npsQuestionsIds = pesquisa.perguntas
    .filter((pergunta) => pergunta.tipo === 'ESCALA_NPS')
    .map((pergunta) => pergunta.id)

  const notasNPS: number[] = []

  pesquisa.envios.forEach((envio) => {
    npsQuestionsIds.forEach((questionId) => {
      const resposta = getRespostaValue(envio, questionId)
      const nota = resposta !== null ? asNumber(resposta) : null

      if (nota !== null) {
        notasNPS.push(nota)
      }
    })
  })

  const npsScore = calculateNPS(notasNPS)

  return (
    <div className="space-y-10 animate-in fade-in pb-20 duration-500 font-inter">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/pesquisas"
            className="group rounded-2xl border border-transparent p-2.5 text-gray-400 transition-all hover:border-gray-200 hover:bg-white hover:text-gray-900 hover:shadow-sm"
          >
            <ArrowLeft size={22} className="transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <div>
            <SurveyDateHeader
              pesquisaId={pesquisa.id}
              dataInicio={pesquisa.dataInicio}
              dataFim={pesquisa.dataFim}
              createdAt={pesquisa.createdAt}
            />
            <h1 className="leading-none text-3xl font-black tracking-tight text-gray-900">{pesquisa.titulo}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/pesquisas/${pesquisa.id}/envios`}
            className="group flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700"
          >
            <Send size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>Monitorar / Novo Envio</span>
          </Link>
          {pesquisa.dataFim && new Date(pesquisa.dataFim) < new Date() ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-red-600 shadow-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-xs font-black uppercase tracking-wider">Finalizada</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-emerald-600 shadow-sm">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-black uppercase tracking-wider">{pesquisa.ativa ? 'Pesquisa Ativa' : 'Pesquisa Inativa'}</span>
            </div>
          )}
          <DeleteSurveyButton surveyId={pesquisa.id} redirectToList variant="full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          color={notasNPS.length > 0 && npsScore < 0 ? 'text-red-600 bg-red-50 border-red-100' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}
          description={notasNPS.length > 0 ? 'Media de satisfacao' : 'Aguardando respostas'}
        />
        <MiniStatCard
          label="Taxa de Conversao"
          value={`${taxaResposta.toFixed(1)}%`}
          icon={<TrendingUp size={24} />}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          description="Abertura x Resposta"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-600/20">
              <PieChart size={20} />
            </div>
            <div>
              <h2 className="leading-none text-xl font-black text-gray-900">Analise por Pergunta</h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Desempenho quantitativo e qualitativo</p>
            </div>
          </div>
          <div className="mx-8 hidden h-px flex-1 bg-gray-100 sm:block" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800 p-2 text-white shadow-lg shadow-slate-800/20">
            <List size={20} />
          </div>
          <div>
            <h2 className="leading-none text-xl font-black text-gray-900">Detalhamento Individual</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Visao completa por cliente e pergunta</p>
          </div>
        </div>

        <SurveyResponseTable envios={pesquisa.envios} perguntas={pesquisa.perguntas} />
      </div>
    </div>
  )
}

function QuestionAnalyticsCard({ pergunta, index, envios }: QuestionAnalyticsCardProps) {
  const respostas = envios
    .filter((envio) => envio.status === 'RESPONDIDO' && envio.resposta)
    .map((envio) => getRespostaValue(envio, pergunta.id))
    .filter((resposta): resposta is Prisma.JsonValue => resposta !== null)

  const total = respostas.length
  const opcoes = asStringArray(pergunta.opcoes)
  const respostasNumericas = getNumberResponses(respostas)
  const respostasTexto = getTextResponses(respostas)
  const notaMedia = respostasNumericas.length > 0
    ? respostasNumericas.reduce((acc, value) => acc + value, 0) / respostasNumericas.length
    : 0
  const npsPergunta = respostasNumericas.length > 0 ? calculateNPS(respostasNumericas) : 0

  return (
    <div className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-colors hover:border-indigo-200">
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Pergunta {index + 1}</span>
          <h3 className="text-lg font-bold leading-tight text-gray-900">{pergunta.titulo}</h3>
        </div>
        <div className="shrink-0 rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-400">
          {total} resps.
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center">
          <p className="text-sm font-medium text-gray-400">Nenhuma resposta disponivel ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pergunta.tipo === 'MULTIPLA_ESCOLHA' && (
            <div className="space-y-4">
              {opcoes.map((opcao) => {
                const count = respostas.filter((resposta) => resposta === opcao).length
                const percent = (count / total) * 100

                return (
                  <div key={opcao} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-600">{opcao}</span>
                      <span className="text-indigo-600">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
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
                  count={respostasNumericas.filter((value) => value >= 9).length}
                  total={total}
                  color="bg-emerald-500"
                  sub="9-10"
                />
                <NPSBreakdownItem
                  label="Neutros"
                  count={respostasNumericas.filter((value) => value >= 7 && value <= 8).length}
                  total={total}
                  color="bg-amber-400"
                  sub="7-8"
                />
                <NPSBreakdownItem
                  label="Insatisfeitos"
                  count={respostasNumericas.filter((value) => value <= 6).length}
                  total={total}
                  color="bg-red-500"
                  sub="0-6"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">NPS Score</span>
                  <span className={`text-2xl font-black ${npsPergunta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {npsPergunta}
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nota Media</span>
                  <span className="text-2xl font-black text-gray-700">{notaMedia.toFixed(1)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-indigo-100/50 bg-indigo-50/30 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600/80">
                  O NPS varia de -100 a 100. Score negativo indica que ha mais clientes insatisfeitos que satisfeitos.
                </p>
              </div>
            </div>
          )}

          {pergunta.tipo === 'ESTRELAS' && (
            <div className="flex flex-col items-center rounded-2xl border border-amber-100/50 bg-amber-50/30 py-4">
              <span className="text-4xl font-black text-amber-500">{notaMedia.toFixed(1)}</span>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= Math.round(notaMedia) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-amber-600/60">Media de Avaliacao</span>
            </div>
          )}

          {pergunta.tipo === 'TEXTO_LIVRE' && (
            <div className="space-y-3">
              {respostasTexto.slice(0, 3).map((resposta, indexTexto) => (
                <div key={`${pergunta.id}-${indexTexto}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs font-medium italic text-gray-600">
                  &quot;{resposta}&quot;
                </div>
              ))}
              {total > 3 && <p className="text-center text-[10px] font-bold text-gray-400">Mais {total - 3} respostas ocultas</p>}
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
  const percent = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-20 w-full flex-col items-center justify-end overflow-hidden rounded-2xl bg-gray-50 pb-3">
        <div
          className={`absolute bottom-0 w-full ${color} opacity-20 transition-all duration-700`}
          style={{ height: `${percent}%` }}
        />
        <span className="relative z-10 text-lg font-black text-gray-900">{count}</span>
        <span className="relative z-10 text-[9px] font-bold uppercase tracking-tighter text-gray-400">{sub}</span>
      </div>
      <div className="text-center">
        <p className="grow text-[10px] leading-none font-black uppercase tracking-widest text-gray-500">{label}</p>
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
    <div className={`group relative overflow-hidden rounded-3xl border bg-white p-7 shadow-sm transition-all hover:shadow-md ${color.split(' ').pop()}`}>
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] leading-none font-black uppercase tracking-widest text-gray-400">{label}</p>
          <p className={`text-4xl leading-none font-black ${color.split(' ')[0]}`}>{value}</p>
        </div>
        <div className={`rounded-2xl p-3.5 transition-transform group-hover:scale-110 ${color.split(' ').slice(1, 3).join(' ')}`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-4 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        {description}
      </div>
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gray-50 opacity-50 transition-transform duration-1000 group-hover:scale-150" />
    </div>
  )
}
