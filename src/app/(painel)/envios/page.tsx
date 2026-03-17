"use client"

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Users,
  X,
  SendHorizontal,
  Loader2,
  Check,
  PartyPopper,
  MailCheck,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import { importarContatos } from '@/actions/envios'
import { processarDisparo } from '@/actions/disparos'

interface Contato {
  nome: string
  email: string
}

type Step = 'UPLOAD' | 'REVISAO' | 'DISPARO' | 'SUCESSO'

function EnviosContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pesquisaId = searchParams.get('pesquisaId')
  
  const [step, setStep] = useState<Step>('UPLOAD')
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [countImportados, setCountImportados] = useState(0)

  if (!pesquisaId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
          <AlertCircle size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Nenhuma pesquisa selecionada</h2>
          <p className="text-gray-500 max-w-sm mt-2 font-medium">Volte para a lista de pesquisas e selecione uma para configurar o envio.</p>
        </div>
        <Link 
          href="/pesquisas" 
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={18} />
          Voltar para Pesquisas
        </Link>
      </div>
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setErro(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        const validos = data
          .map(row => ({
            nome: row.nome || row.Nome || row.name || row.Name || 'Cliente',
            email: row.email || row.Email || row.mail || row.Mail
          }))
          .filter(c => c.email && c.email.includes('@'))

        if (validos.length === 0) {
          setErro('Nenhum contato válido encontrado no arquivo. Use as colunas "nome" e "email".')
        } else {
          setContatos(validos)
          setStep('REVISAO')
        }
        setLoading(false)
      },
      error: (error) => {
        setErro('Erro ao ler o arquivo CSV: ' + error.message)
        setLoading(false)
      }
    })
  }

  const handleImportarContatos = async () => {
    setProcessando(true)
    setErro(null)
    
    try {
      const res = await importarContatos(pesquisaId, contatos)
      if (res.success) {
        setCountImportados(res.count || contatos.length)
        setStep('DISPARO')
      } else {
        setErro(res.message || 'Erro ao importar contatos.')
      }
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado na importação.')
    } finally {
      setProcessando(false)
    }
  }

  const handleDispararPesquisas = async () => {
    setProcessando(true)
    setErro(null)

    try {
      const res = await processarDisparo(pesquisaId)
      if (res.success) {
        setStep('SUCESSO')
      } else {
        setErro(res.message || 'Erro ao processar disparo.')
      }
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado no disparo.')
    } finally {
      setProcessando(false)
    }
  }

  // Renderizador de Steps (UI Visual de Progresso)
  const renderStepsHeader = () => {
    const steps = [
      { id: 'UPLOAD', label: 'Upload' },
      { id: 'REVISAO', label: 'Revisão' },
      { id: 'DISPARO', label: 'Disparo' }
    ]
    
    return (
      <div className="flex items-center justify-center gap-4 mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
              step === s.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105' 
              : 'bg-white text-gray-400 border border-gray-100'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.id ? 'bg-white text-indigo-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {i + 1}
              </div>
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="w-8 h-[2px] bg-gray-100 rounded-full" />}
          </div>
        ))}
      </div>
    )
  }

  // --- RENDERS POR ESTADO ---

  if (step === 'SUCESSO') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
            <MailCheck size={60} />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-md animate-bounce">
            <PartyPopper size={24} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Pesquisa Disparada!</h1>
          <p className="text-xl text-gray-500 font-medium max-w-md mx-auto">
            Sensacional! Suas pesquisas foram enviadas para <span className="text-indigo-600 font-bold">{countImportados}</span> clientes.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <Link 
            href="/dashboard"
            className="bg-slate-900 border-2 border-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-slate-900/10"
          >
            Acompanhar Resultados
          </Link>
          <button 
             onClick={() => router.push('/pesquisas')}
             className="px-10 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-200"
          >
            Voltar para Pesquisas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => step === 'UPLOAD' ? router.push('/pesquisas') : setStep('UPLOAD')}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fluxo de Envio</h1>
          <p className="text-sm text-gray-500 font-medium font-sans italic opacity-75">Siga as etapas para iniciar sua campanha.</p>
        </div>
      </div>

      {renderStepsHeader()}

      {/* STEP 1: UPLOAD */}
      {step === 'UPLOAD' && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center transition-all hover:border-indigo-300 group shadow-sm bg-gradient-to-b from-white to-gray-50/30">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-500 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            {loading ? <Loader2 size={40} className="animate-spin" /> : <Upload size={40} />}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Selecione sua lista de clientes</h3>
          <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium text-base">Prepare um arquivo CSV contendo as colunas <span className="text-gray-900 font-bold underline decoration-indigo-500 underline-offset-4">nome</span> e <span className="text-gray-900 font-bold underline decoration-indigo-500 underline-offset-4">email</span>.</p>
          
          <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-indigo-600/40 cursor-pointer inline-flex items-center gap-3 active:scale-95">
            <FileText size={24} />
            Escolher Arquivo CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </div>
      )}

      {/* STEP 2: REVISAO */}
      {step === 'REVISAO' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-400">
          <div className="px-8 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Revisão de Contatos</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{contatos.length} destinatários prontos</p>
              </div>
            </div>
            <button 
              onClick={() => { setContatos([]); setStep('UPLOAD'); }}
              className="text-gray-400 hover:text-red-500 p-2 bg-gray-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 sticky top-0 border-b border-gray-100 backdrop-blur-sm z-10">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-10 py-4">Nome Completo</th>
                  <th className="px-10 py-4">E-mail de Destino</th>
                  <th className="px-10 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contatos.slice(0, 50).map((c, i) => (
                  <tr key={i} className="text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-4 font-bold text-gray-700">{c.nome}</td>
                    <td className="px-10 py-4 text-gray-500 font-medium">{c.email}</td>
                    <td className="px-10 py-4 text-center">
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-amber-100">Pendente</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Mostrando os primeiros {contatos.length} registros</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep('UPLOAD')}
                className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                disabled={processando}
              >
                Refazer Upload
              </button>
              <button 
                onClick={handleImportarContatos}
                disabled={processando}
                className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center gap-2 group"
              >
                {processando ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                Próxima Etapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DISPARO FINAL */}
      {step === 'DISPARO' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-12 text-center space-y-8 animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
             <SendHorizontal size={40} />
           </div>
           
           <div className="space-y-2">
             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tudo pronto para os envios?</h2>
             <p className="text-gray-500 font-medium max-w-sm mx-auto">
                Sua lista com <span className="text-indigo-600 font-bold">{countImportados} contatos</span> foi processada com sucesso.
             </p>
           </div>

           <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-xs mx-auto flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-emerald-100">
                <Check size={14} /> Lista Validada
              </div>
              <p className="text-xs text-gray-400 font-medium italic">Lembre-se: Após o disparo, os links de pesquisa serão únicos para cada cliente.</p>
           </div>

           <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
              <button 
                onClick={handleDispararPesquisas}
                disabled={processando}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-3xl font-black text-lg transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 group"
              >
                {processando ? <Loader2 size={24} className="animate-spin" /> : <SendHorizontal size={24} />}
                {processando ? 'Processando Envio...' : `Disparar para ${countImportados} Clientes Agora`}
              </button>
              <button 
                onClick={() => setStep('REVISAO')}
                disabled={processando}
                className="text-gray-400 hover:text-gray-600 font-bold transition-colors"
              >
                Voltar e Revisar
              </button>
           </div>
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-700 animate-in shake duration-500 shadow-xl shadow-red-100/50">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle size={24} className="shrink-0" />
          </div>
          <p className="text-sm font-bold leading-relaxed">{erro}</p>
        </div>
      )}
    </div>
  )
}

export default function EnviosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>}>
      <EnviosContent />
    </Suspense>
  )
}
