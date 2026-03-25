"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Type, 
  Hash, 
  ListChecks, 
  Star,
  GripVertical,
  Loader2
} from 'lucide-react'
import { PerguntaInput, TipoPergunta } from '@/types/pesquisa'
import { salvarPesquisa } from '@/actions/pesquisas'
import { ServiceResponse } from '@/types/responses'

export default function EditorPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Identidade, 2: Estrutura, 3: Revisão
  const [titulo, setTitulo] = useState('Nova Pesquisa')
  const [descricao, setDescricao] = useState('')
  const [perguntas, setPerguntas] = useState<PerguntaInput[]>([])
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const adicionarPergunta = (tipo: TipoPergunta) => {
    const novaPergunta: PerguntaInput = {
      id: crypto.randomUUID(),
      titulo: 'Nova Pergunta',
      tipo,
      obrigatoria: true,
      ordem: perguntas.length,
      opcoes: tipo === 'MULTIPLA_ESCOLHA' ? ['Opção 1', 'Opção 2'] : undefined
    }
    setPerguntas([...perguntas, novaPergunta])
  }

  const removerPergunta = (id: string) => {
    setPerguntas(perguntas.filter(p => p.id !== id))
  }

  const atualizarPergunta = (id: string, updates: Partial<PerguntaInput>) => {
    setPerguntas(perguntas.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const [showSuccess, setShowSuccess] = useState(false)
  const [pesquisaIdCriada, setPesquisaIdCriada] = useState<string | null>(null)

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      alert('Por favor, insira um título para a pesquisa.')
      setStep(1)
      return
    }

    setIsSaving(true)
    try {
      const result = await salvarPesquisa({
        titulo,
        descricao,
        dataInicio,
        dataFim,
        perguntas: perguntas.map(({ id, ...rest }) => rest)
      })

      if (result.success && result.data) {
        setPesquisaIdCriada(result.data.id ?? null)
        setShowSuccess(true)
      } else {
        const errorMsg = !result.success ? result.error?.message || 'Erro desconhecido' : 'Erro desconhecido'
        alert('Erro ao salvar: ' + errorMsg)
      }
    } catch (error) {
      alert('Ocorreu um erro inesperado.')
    } finally {
      setIsSaving(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Save size={48} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesquisa Salva!</h1>
            <p className="text-gray-500 font-medium">O que você deseja fazer agora?</p>
          </div>
          <div className="flex flex-col gap-3">
             <Link 
               href={`/pesquisas/${pesquisaIdCriada}/envios`}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group"
             >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              Adicionar Clientes e Disparar
            </Link>
            <Link 
              href="/dashboard"
              className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Header com Stepper */}
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-indigo-600 border border-transparent hover:border-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2">
              <StepItem num={1} active={step >= 1} current={step === 1} label="Identidade" />
              <div className={`w-8 h-[2px] ${step > 1 ? 'bg-indigo-600' : 'bg-gray-100'}`} />
              <StepItem num={2} active={step >= 2} current={step === 2} label="Estrutura" />
              <div className={`w-8 h-[2px] ${step > 2 ? 'bg-indigo-600' : 'bg-gray-100'}`} />
              <StepItem num={3} active={step >= 3} current={step === 3} label="Revisão" />
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {step === 3 && (
            <button
              onClick={handleSalvar}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Finalizar e Salvar
            </button>
           )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Painel de Controle (Wizard Lateral) */}
        <aside className="w-[400px] bg-white border-r border-gray-100 flex flex-col shadow-2xl shadow-gray-200/50 z-10">
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {step === 1 && (
              <section className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Identidade</h3>
                  <p className="text-sm text-gray-400 font-medium">Defina as bases da sua pesquisa.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Título da Pesquisa</label>
                    <input 
                      type="text" 
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: Satisfação Trimestral 2024"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Descrição / Convite</label>
                    <textarea 
                      rows={5}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Conte para o cliente por que a opinião dele é importante..."
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium resize-none text-gray-700 placeholder:text-gray-300 shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Início</label>
                      <input 
                        type="date" 
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-xs font-bold text-gray-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Fim</label>
                      <input 
                        type="date" 
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-xs font-bold text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Estrutura</h3>
                  <p className="text-sm text-gray-400 font-medium">Adicione as perguntas do formulário.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <AddButton 
                    onClick={() => adicionarPergunta('TEXTO_LIVRE')} 
                    icon={<Type size={20} />} 
                    label="Resposta de Texto" 
                    desc="O cliente escreve livremente."
                  />
                  <AddButton 
                    onClick={() => adicionarPergunta('ESCALA_NPS')} 
                    icon={<Hash size={20} />} 
                    label="Escala NPS (0-10)" 
                    desc="Mede fidelidade e satisfação."
                  />
                  <AddButton 
                    onClick={() => adicionarPergunta('MULTIPLA_ESCOLHA')} 
                    icon={<ListChecks size={20} />} 
                    label="Múltipla Escolha" 
                    desc="Lista de opções fechadas."
                  />
                  <AddButton 
                    onClick={() => adicionarPergunta('ESTRELAS')} 
                    icon={<Star size={20} />} 
                    label="Avaliação em Estrelas" 
                    desc="Clássico 1 a 5 estrelas."
                  />
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Revisão</h3>
                  <p className="text-sm text-gray-400 font-medium">Confira se está tudo certo.</p>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-indigo-600 font-semibold tracking-tight">Perguntas Totais</span>
                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">{perguntas.length}</span>
                  </div>
                  <div className="h-[1px] bg-indigo-100" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Resumo Visual</p>
                    <div className="flex gap-1.5 overflow-hidden active:cursor-grab">
                      {perguntas.map((p, i) => (
                        <div key={i} className="w-6 h-6 rounded-md bg-white border border-indigo-200 flex items-center justify-center flex-shrink-0">
                          {p.tipo === 'TEXTO_LIVRE' && <Type size={10} className="text-indigo-400" />}
                          {p.tipo === 'ESCALA_NPS' && <Hash size={10} className="text-indigo-400" />}
                          {p.tipo === 'MULTIPLA_ESCOLHA' && <ListChecks size={10} className="text-indigo-400" />}
                          {p.tipo === 'ESTRELAS' && <Star size={10} className="text-indigo-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <p className="text-xs text-gray-400 font-medium leading-relaxed">
                     Ao salvar, a pesquisa ficará disponível para envio imediato. Certifique-se de que os textos estão corretos.
                   </p>
                </div>
              </section>
            )}
          </div>

          {/* Footer de Navegação */}
          <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all active:scale-95"
              >
                Voltar
              </button>
            ) : (
              <div className="flex-1" />
            )}
            
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Próximo Passo
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </aside>

        {/* Preview do Formulário (Contextual) */}
        <main className="flex-1 overflow-y-auto p-12 bg-gray-100/30 custom-scrollbar scroll-smooth">
          <div className={`max-w-2xl mx-auto space-y-6 transition-all duration-500 ${step === 1 ? 'scale-105 mt-10' : 'scale-100'}`}>
            <div className={`bg-white rounded-3xl shadow-xl shadow-gray-200/50 border-t-8 border-t-indigo-600 border border-gray-100 p-10 space-y-5 transition-all ${step !== 1 ? 'opacity-60 ring-0' : 'ring-4 ring-indigo-500/5'}`}>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight break-words leading-tight">{titulo || 'Sem Título'}</h1>
              <p className="text-gray-500 font-medium whitespace-pre-wrap break-words leading-relaxed">{descricao || 'Adicione uma descrição para orientar seus participantes...'}</p>
            </div>

            {step >= 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {perguntas.length === 0 ? (
                  <div className="border-3 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center text-gray-400 space-y-4 bg-white/50">
                    <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 text-indigo-500">
                      <Plus size={32} />
                    </div>
                    <p className="font-bold text-gray-900">Nenhuma pergunta adicionada</p>
                    <p className="text-sm font-medium">Use as ferramentas na lateral para começar.</p>
                  </div>
                ) : (
                  perguntas.map((p, idx) => (
                    <QuestionCard 
                      key={p.id} 
                      pergunta={p} 
                      index={idx}
                      readOnly={step === 3}
                      onRemove={() => removerPergunta(p.id!)}
                      onChange={(updates) => atualizarPergunta(p.id!, updates)}
                    />
                  ))
                )}
              </div>
            )}
            
            {step === 3 && (
              <div className="py-10 text-center animate-bounce duration-[2000ms]">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Fim do Preview</p>
                <div className="w-1 h-12 bg-indigo-100 mx-auto rounded-full" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function StepItem({ num, active, current, label }: { num: number, active: boolean, current: boolean, label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
        current ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110' : 
        active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
      }`}>
        {num}
      </div>
      <span className={`text-xs font-bold tracking-tight ${current ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </div>
  )
}

function AddButton({ onClick, icon, label, desc }: { onClick: () => void, icon: React.ReactNode, label: string, desc: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all text-left group active:scale-[0.98]"
    >
      <div className="p-3.5 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all text-indigo-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{label}</p>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5 line-clamp-1">{desc}</p>
      </div>
      <Plus size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
    </button>
  )
}

function QuestionCard({ pergunta, index, onRemove, onChange, readOnly }: { 
  pergunta: PerguntaInput, 
  index: number, 
  readOnly?: boolean,
  onRemove: () => void, 
  onChange: (updates: Partial<PerguntaInput>) => void 
}) {
  return (
    <div className={`bg-white rounded-3xl shadow-lg shadow-gray-200/30 border border-gray-100 p-10 group relative transition-all ${readOnly ? 'opacity-80' : 'hover:shadow-2xl hover:shadow-indigo-500/5'}`}>
      {!readOnly && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-100 transition-colors cursor-grab active:cursor-grabbing">
          <GripVertical size={24} />
        </div>
      )}

      <div className="flex justify-between items-start mb-8 gap-8 pl-2">
        <div className="flex-1">
          {readOnly ? (
            <h4 className="text-xl font-bold text-gray-900 leading-tight">{pergunta.titulo}</h4>
          ) : (
            <textarea 
              rows={1}
              value={pergunta.titulo}
              onChange={(e) => {
                onChange({ titulo: e.target.value })
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              className="w-full text-xl font-bold text-gray-900 outline-none border-b-2 border-transparent focus:border-indigo-500 bg-transparent transition-all placeholder-gray-200 py-1 resize-none break-words whitespace-pre-wrap flex items-center h-auto leading-tight"
              placeholder="Digite o título da pergunta..."
            />
          )}
        </div>
        {!readOnly && (
          <button 
            onClick={onRemove}
            className="p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="pl-2 space-y-6">
        {pergunta.tipo === 'TEXTO_LIVRE' && (
          <div className="w-full h-24 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 italic text-sm font-medium">
            Campo de resposta de texto...
          </div>
        )}

        {pergunta.tipo === 'ESCALA_NPS' && (
          <div className="flex gap-2">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="flex-1 h-12 flex items-center justify-center border border-gray-200 rounded-xl text-sm font-black text-gray-500 bg-gray-50">
                {i}
              </div>
            ))}
          </div>
        )}

        {pergunta.tipo === 'ESTRELAS' && (
          <div className="flex gap-3 text-yellow-400/20">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={40} fill="currentColor" />
            ))}
          </div>
        )}

        {pergunta.tipo === 'MULTIPLA_ESCOLHA' && (
          <div className="space-y-4">
             {pergunta.opcoes?.map((opt: string, i: number) => (
               <div key={i} className="flex items-center gap-4">
                 <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-gray-50" />
                 {readOnly ? (
                    <span className="text-gray-700 font-medium">{opt}</span>
                 ) : (
                    <input 
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(pergunta.opcoes || [])]
                        newOpts[i] = e.target.value
                        onChange({ opcoes: newOpts })
                      }}
                      className="flex-1 text-base text-gray-900 outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all font-medium"
                    />
                 )}
               </div>
             ))}
             {!readOnly && (
               <button 
                onClick={() => onChange({ opcoes: [...(pergunta.opcoes || []), `Opção ${(pergunta.opcoes?.length || 0) + 1}`] })}
                className="text-sm font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mt-2 px-1"
               >
                 <Plus size={16} /> Adicionar Opção
               </button>
             )}
          </div>
        )}
      </div>

      <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between pl-2">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
          {pergunta.tipo.replace('_', ' ')}
        </span>
        {!readOnly && (
          <label className="flex items-center gap-3 cursor-pointer group/label">
            <input 
              type="checkbox" 
              checked={pergunta.obrigatoria}
              onChange={(e) => onChange({ obrigatoria: e.target.checked })}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500/20 transition-all" 
            />
            <span className="text-sm font-bold text-gray-400 group-hover/label:text-gray-900 transition-colors uppercase tracking-tight">Obrigatória</span>
          </label>
        )}
      </div>
    </div>
  )
}
