"use client"

import { useState } from 'react'
import { salvarResposta } from '@/actions/respostas'
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  SendHorizontal,
  Star,
  Loader2
} from 'lucide-react'

import { Prisma } from '@prisma/client'

type EnvioComPesquisa = Prisma.EnvioGetPayload<{
  select: {
    id: true,
    emailDestinatario: true,
    nomeDestinatario: true,
    status: true,
    token: true,
    pesquisaId: true,
    pesquisa: {
      select: {
        id: true,
        titulo: true,
        descricao: true,
        ativa: true,
        dataInicio: true,
        dataFim: true,
        createdAt: true,
        empresa: { select: { nome: true } },
        perguntas: { orderBy: { ordem: 'asc' } }
      }
    }
  }
}>

interface Props {
  envio: EnvioComPesquisa
  pesquisa: EnvioComPesquisa['pesquisa']
}

export default function PublicSurveyForm({ envio, pesquisa }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, any>>({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)

  const perguntaAtual = pesquisa.perguntas[currentStep]
  const totalPerguntas = pesquisa.perguntas.length
  const progresso = ((currentStep + 1) / totalPerguntas) * 100

  const handleUpdateResposta = (valor: any) => {
    setRespostas(prev => ({ ...prev, [perguntaAtual.id]: valor }))
  }

  const handleToggleOption = (opcao: string) => {
    const current = (respostas[perguntaAtual.id] || []) as string[]
    const newValues = current.includes(opcao)
      ? current.filter(o => o !== opcao)
      : [...current, opcao]
    setRespostas(prev => ({ ...prev, [perguntaAtual.id]: newValues }))
  }

  const handleNext = () => {
    if (currentStep < totalPerguntas - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setEnviando(true)
    setErro(null)

    try {
      const res = await salvarResposta(envio.id, respostas)
      if (res.success) {
        setConcluido(true)
      } else {
        setErro(res.error?.message || 'Erro ao salvar resposta.')
      }
    } catch (err: any) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  const isRespostaValida = () => {
    const valor = respostas[perguntaAtual.id]
    if (!perguntaAtual.obrigatoria) return true
    
    if (perguntaAtual.tipo === 'MULTIPLA_ESCOLHA') {
      return Array.isArray(valor) && valor.length > 0
    }
    
    if (perguntaAtual.tipo === 'TEXTO_LIVRE') {
      return typeof valor === 'string' && valor.trim().length > 0
    }
    
    return valor !== undefined && valor !== null
  }

  if (concluido) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Muito Obrigado!</h1>
          <p className="text-gray-500 font-medium">Sua opinião é fundamental para melhorarmos continuamente nossos serviços.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-5 sm:p-8 md:p-12 relative overflow-hidden flex flex-col min-h-[400px]">
      {/* Barra de Progresso */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center py-6">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
          Pergunta {currentStep + 1} de {totalPerguntas}
        </span>
        
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight break-words">
          {perguntaAtual.titulo}
        </h2>

        {/* Renderização condicional por tipo de pergunta */}
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          
          {/* NPS (0-10) */}
          {perguntaAtual.tipo === 'ESCALA_NPS' && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleUpdateResposta(i)}
                  onKeyDown={(e) => {
                    if (e.key === i.toString()) handleUpdateResposta(i)
                  }}
                  className={`min-h-[44px] min-w-[44px] aspect-square rounded-xl font-bold transition-all flex items-center justify-center border-2 focus-visible:ring-4 focus-visible:ring-indigo-500/20 outline-none text-base ${
                    respostas[perguntaAtual.id] === i 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}

          {/* Estrelas (1-5) */}
          {perguntaAtual.tipo === 'ESTRELAS' && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full max-w-full">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleUpdateResposta(s)}
                  className={`p-2 sm:p-3 rounded-2xl transition-all transform hover:scale-110 shrink-0 ${
                    respostas[perguntaAtual.id] >= s ? 'text-amber-400 stroke-amber-500 fill-amber-400' : 'text-gray-200'
                  }`}
                >
                  <Star className={`w-8 h-8 sm:w-12 sm:h-12 ${respostas[perguntaAtual.id] >= s ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          )}

          {/* Texto Livre */}
          {perguntaAtual.tipo === 'TEXTO_LIVRE' && (
            <textarea
              className="w-full h-40 p-4 bg-gray-50 border-2 border-transparent border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium text-base resize-none"
              placeholder="Sua resposta aqui..."
              value={respostas[perguntaAtual.id] || ''}
              onChange={(e) => handleUpdateResposta(e.target.value)}
            />
          )}

          {/* Múltipla Escolha (Checkboxes) */}
          {perguntaAtual.tipo === 'MULTIPLA_ESCOLHA' && (
            <div className="grid grid-cols-1 gap-3">
              {(perguntaAtual.opcoes as string[] || []).map((opcao, idx) => {
                const isSelected = (respostas[perguntaAtual.id] || []).includes(opcao)
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleOption(opcao)}
                    className={`p-5 rounded-2xl font-bold text-left transition-all border-2 flex items-center gap-3 min-h-[56px] ${
                      isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-base">{opcao}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {erro && (
          <p className="mt-4 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl animate-in shake duration-300">
             {erro}
          </p>
        )}
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || enviando}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold disabled:opacity-0 transition-opacity"
        >
          <ChevronLeft size={20} />
          Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!isRespostaValida() || enviando}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl disabled:opacity-50 disabled:shadow-none min-h-[48px] ${
            currentStep === totalPerguntas - 1 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20' 
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
          }`}
        >
          {enviando ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {currentStep === totalPerguntas - 1 ? 'Enviar Resposta' : 'Próxima'}
              {currentStep === totalPerguntas - 1 ? <SendHorizontal size={18} /> : <ChevronRight size={18} />}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
