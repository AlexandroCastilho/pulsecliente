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

export default function EditorPage() {
  const router = useRouter()
  const [titulo, setTitulo] = useState('Nova Pesquisa')
  const [descricao, setDescricao] = useState('')
  const [perguntas, setPerguntas] = useState<PerguntaInput[]>([])
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
      return
    }

    setIsSaving(true)
    try {
      const result = await salvarPesquisa({
        titulo,
        descricao,
        perguntas: perguntas.map(({ id, ...rest }) => rest)
      })

      if (result.success) {
        setPesquisaIdCriada(result.id ?? null)
        setShowSuccess(true)
      } else {
        alert('Erro ao salvar: ' + (result.message || 'Erro desconhecido'))
        if (result.details) console.error('Detalhes do erro:', result.details)
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
              href={`/envios?pesquisaId=${pesquisaIdCriada}`}
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
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-[1px] bg-gray-200" />
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Editor de Pesquisa</h1>
        </div>

        <button
          onClick={handleSalvar}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Salvar Pesquisa</span>
            </>
          )}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Painel de Controle (Esquerda) */}
        <aside className="w-96 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Geral</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea 
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all sm:text-sm resize-none text-gray-900"
                  placeholder="Explique o objetivo desta pesquisa..."
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adicionar Pergunta</h3>
            <div className="grid grid-cols-2 gap-3">
              <AddButton 
                onClick={() => adicionarPergunta('TEXTO_LIVRE')} 
                icon={<Type size={18} />} 
                label="Texto Livre" 
              />
              <AddButton 
                onClick={() => adicionarPergunta('ESCALA_NPS')} 
                icon={<Hash size={18} />} 
                label="NPS" 
              />
              <AddButton 
                onClick={() => adicionarPergunta('MULTIPLA_ESCOLHA')} 
                icon={<ListChecks size={18} />} 
                label="Escolha" 
              />
              <AddButton 
                onClick={() => adicionarPergunta('ESTRELAS')} 
                icon={<Star size={18} />} 
                label="Estrelas" 
              />
            </div>
          </section>
        </aside>

        {/* Preview do Formulário (Direita) */}
        <main className="flex-1 overflow-y-auto p-12 bg-gray-50 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border-t-8 border-t-indigo-600 border border-gray-200 p-8 space-y-4 overflow-hidden">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight break-words">{titulo}</h1>
              <p className="text-gray-500 whitespace-pre-wrap break-words">{descricao}</p>
            </div>

            {perguntas.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Plus size={32} />
                </div>
                <p className="font-medium">Sua pesquisa ainda não tem perguntas.</p>
                <p className="text-sm">Clique nos botões à esquerda para adicionar.</p>
              </div>
            ) : (
              perguntas.map((p, idx) => (
                <QuestionCard 
                  key={p.id} 
                  pergunta={p} 
                  index={idx}
                  onRemove={() => removerPergunta(p.id!)}
                  onChange={(updates) => atualizarPergunta(p.id!, updates)}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function AddButton({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 border border-gray-100 bg-gray-50 rounded-xl hover:bg-white hover:border-indigo-200 hover:shadow-md hover:text-indigo-600 transition-all gap-2 group"
    >
      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all text-gray-400 group-hover:text-indigo-600">
        {icon}
      </div>
      <span className="text-xs font-bold tracking-tight uppercase">{label}</span>
    </button>
  )
}

function QuestionCard({ pergunta, index, onRemove, onChange }: { 
  pergunta: PerguntaInput, 
  index: number, 
  onRemove: () => void, 
  onChange: (updates: Partial<PerguntaInput>) => void 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 group relative hover:shadow-md transition-all">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200 transition-colors">
        <GripVertical size={20} />
      </div>

      <div className="flex justify-between items-start mb-6 gap-6 pl-2">
        <div className="flex-1">
          <textarea 
            rows={1}
            value={pergunta.titulo}
            onChange={(e) => {
              onChange({ titulo: e.target.value })
              // Auto-resize logic
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            className="w-full text-lg font-bold text-gray-900 outline-none border-b-2 border-transparent focus:border-indigo-500 bg-transparent transition-all placeholder-gray-300 py-1 resize-none break-words whitespace-pre-wrap flex items-center h-auto"
            placeholder="Digite o título da pergunta..."
          />
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="pl-2 space-y-4">
        {pergunta.tipo === 'TEXTO_LIVRE' && (
          <div className="w-full h-24 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 italic text-sm">
            Campo de resposta de texto...
          </div>
        )}

        {pergunta.tipo === 'ESCALA_NPS' && (
          <div className="flex gap-2">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="flex-1 h-12 flex items-center justify-center border border-gray-200 rounded-lg text-sm font-bold text-gray-500 bg-gray-50">
                {i}
              </div>
            ))}
          </div>
        )}

        {pergunta.tipo === 'ESTRELAS' && (
          <div className="flex gap-2 text-gray-200">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={32} fill="currentColor" />
            ))}
          </div>
        )}

        {pergunta.tipo === 'MULTIPLA_ESCOLHA' && (
          <div className="space-y-3">
             {pergunta.opcoes?.map((opt: string, i: number) => (
               <div key={i} className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full border border-gray-300" />
                 <input 
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pergunta.opcoes]
                    newOpts[i] = e.target.value
                    onChange({ opcoes: newOpts })
                  }}
                  className="flex-1 text-sm text-gray-900 outline-none border-b border-transparent focus:border-indigo-500"
                 />
               </div>
             ))}
             <button 
              onClick={() => onChange({ opcoes: [...(pergunta.opcoes || []), `Opção ${(pergunta.opcoes?.length || 0) + 1}`] })}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
             >
               <Plus size={14} /> Adicionar Opção
             </button>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between pl-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
          {pergunta.tipo.replace('_', ' ')}
        </span>
        <label className="flex items-center gap-2 cursor-pointer group/label">
          <input 
            type="checkbox" 
            checked={pergunta.obrigatoria}
            onChange={(e) => onChange({ obrigatoria: e.target.checked })}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
          />
          <span className="text-sm font-semibold text-gray-500 group-hover/label:text-gray-700">Obrigatória</span>
        </label>
      </div>
    </div>
  )
}
