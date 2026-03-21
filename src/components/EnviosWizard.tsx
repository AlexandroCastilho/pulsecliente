"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  FileText, 
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
import { sanitizeErrorMessage } from '@/lib/error-handler'

interface Contato {
  nome: string
  email: string
}

type Step = 'UPLOAD' | 'REVISAO' | 'DISPARO' | 'SUCESSO'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export function EnviosWizard({ pesquisaId }: { pesquisaId: string }) {
  const router = useRouter()
  
  const [step, setStep] = useState<Step>('UPLOAD')
  const [contatos, setContatos] = useState<Contato[]>([])
  const [nomeManual, setNomeManual] = useState('')
  const [emailManual, setEmailManual] = useState('')
  const [blocoManual, setBlocoManual] = useState('')
  const [resumoImportacao, setResumoImportacao] = useState<{
    origem: 'csv' | 'manual' | 'bloco'
    adicionados: number
    ignoradosInvalidos: number
    ignoradosDuplicados: number
    exemplosInvalidos: string[]
    exemplosDuplicados: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [countImportados, setCountImportados] = useState(0)

  const isEmailValido = (email: string) => EMAIL_REGEX.test(email)

  const mergeContatos = (listaAtual: Contato[], novos: Contato[]) => {
    const porEmail = new Map<string, Contato>()

    for (const contato of [...listaAtual, ...novos]) {
      const emailNormalizado = contato.email.trim().toLowerCase()
      if (!emailNormalizado) continue

      porEmail.set(emailNormalizado, {
        nome: contato.nome?.trim() || 'Cliente',
        email: emailNormalizado,
      })
    }

    return Array.from(porEmail.values())
  }

  const adicionarContatoManual = () => {
    const email = emailManual.trim().toLowerCase()
    const nome = nomeManual.trim() || 'Cliente'
    const emailValido = isEmailValido(email)

    if (!emailValido) {
      setErro('Não foi possível adicionar o cliente. Confira se o e-mail está completo, incluindo o domínio (ex.: cliente@empresa.com).')
      setResumoImportacao({
        origem: 'manual',
        adicionados: 0,
        ignoradosInvalidos: 1,
        ignoradosDuplicados: 0,
        exemplosInvalidos: [emailManual.trim() || '(vazio)'],
        exemplosDuplicados: [],
      })
      return
    }

    setErro(null)
    setContatos((prev) => {
      const emailExiste = prev.some((c) => c.email === email)
      const merged = mergeContatos(prev, [{ nome, email }])
      const adicionados = merged.length - prev.length
      setResumoImportacao({
        origem: 'manual',
        adicionados,
        ignoradosInvalidos: 0,
        ignoradosDuplicados: adicionados === 0 ? 1 : 0,
        exemplosInvalidos: [],
        exemplosDuplicados: emailExiste ? [`${nome}, ${email}`] : [],
      })
      return merged
    })
    setNomeManual('')
    setEmailManual('')
  }

  const adicionarContatosEmBloco = () => {
    const linhas = blocoManual
      .split('\n')
      .map((linha) => linha.trim())
      .filter(Boolean)

    if (linhas.length === 0) {
      setErro('Cole ao menos uma linha para continuar. Exemplo: "Nome, email@dominio.com".')
      return
    }

    const contatosValidos: Contato[] = []
    const exemplosInvalidos: string[] = []

    for (const linha of linhas) {
      const partes = linha
        .split(/[;,\t]/)
        .map((parte) => parte.trim())
        .filter(Boolean)

      if (partes.length === 0) continue

      if (partes.length === 1) {
        const email = partes[0].toLowerCase()
        const emailValido = isEmailValido(email)
        if (emailValido) contatosValidos.push({ nome: 'Cliente', email })
        else if (exemplosInvalidos.length < 5) exemplosInvalidos.push(linha)
        continue
      }

      const nome = partes[0] || 'Cliente'
      const email = partes[1].toLowerCase()
      const emailValido = isEmailValido(email)

      if (emailValido) {
        contatosValidos.push({ nome, email })
      } else if (exemplosInvalidos.length < 5) {
        exemplosInvalidos.push(linha)
      }
    }

    if (contatosValidos.length === 0) {
      setErro('Não encontramos contatos válidos no texto colado. Revise o formato e tente novamente.')
      return
    }

    setErro(null)
    setContatos((prev) => {
      const prevEmails = new Set(prev.map((c) => c.email))
      const unicosPorEmail = new Map<string, Contato>()
      const exemplosDuplicados: string[] = []

      for (const contato of contatosValidos) {
        if (unicosPorEmail.has(contato.email)) {
          if (exemplosDuplicados.length < 5) {
            exemplosDuplicados.push(`${contato.nome}, ${contato.email}`)
          }
          continue
        }
        unicosPorEmail.set(contato.email, contato)
      }

      let duplicadosExistentes = 0
      for (const contato of unicosPorEmail.values()) {
        if (prevEmails.has(contato.email)) {
          duplicadosExistentes += 1
          if (exemplosDuplicados.length < 5) {
            exemplosDuplicados.push(`${contato.nome}, ${contato.email}`)
          }
        }
      }

      const merged = mergeContatos(prev, contatosValidos)
      const adicionados = merged.length - prev.length
      const ignoradosInvalidos = linhas.length - contatosValidos.length
      const ignoradosDuplicados = (contatosValidos.length - unicosPorEmail.size) + duplicadosExistentes

      setResumoImportacao({
        origem: 'bloco',
        adicionados,
        ignoradosInvalidos,
        ignoradosDuplicados,
        exemplosInvalidos,
        exemplosDuplicados,
      })
      return merged
    })
    setBlocoManual('')
  }

  const removerContato = (email: string) => {
    setContatos((prev) => prev.filter((contato) => contato.email !== email))
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
        const normalizados = data
          .map(row => ({
            nome: row.nome || row.Nome || row.name || row.Name || 'Cliente',
            email: (row.email || row.Email || row.mail || row.Mail || '').toString().trim().toLowerCase()
          }))
        const validos = normalizados.filter(c => isEmailValido(c.email))
        const exemplosInvalidos = normalizados
          .filter(c => !isEmailValido(c.email))
          .slice(0, 5)
          .map(c => `${c.nome}, ${c.email || '(sem email)'}`)

        if (validos.length === 0) {
          setErro('Não encontramos contatos válidos no arquivo. Use as colunas "nome" e "email".')
        } else {
          setContatos((prev) => {
            const prevEmails = new Set(prev.map((c) => c.email))
            const unicosPorEmail = new Map<string, Contato>()
            const exemplosDuplicados: string[] = []

            for (const contato of validos) {
              if (unicosPorEmail.has(contato.email)) {
                if (exemplosDuplicados.length < 5) {
                  exemplosDuplicados.push(`${contato.nome}, ${contato.email}`)
                }
                continue
              }
              unicosPorEmail.set(contato.email, contato)
            }

            let duplicadosExistentes = 0
            for (const contato of unicosPorEmail.values()) {
              if (prevEmails.has(contato.email)) {
                duplicadosExistentes += 1
                if (exemplosDuplicados.length < 5) {
                  exemplosDuplicados.push(`${contato.nome}, ${contato.email}`)
                }
              }
            }

            const merged = mergeContatos(prev, validos)
            const adicionados = merged.length - prev.length
            const ignoradosInvalidos = normalizados.length - validos.length
            const ignoradosDuplicados = (validos.length - unicosPorEmail.size) + duplicadosExistentes

            setResumoImportacao({
              origem: 'csv',
              adicionados,
              ignoradosInvalidos,
              ignoradosDuplicados,
              exemplosInvalidos,
              exemplosDuplicados,
            })
            return merged
          })
          setStep('REVISAO')
        }
        setLoading(false)
      },
      error: (error) => {
        setErro('Não foi possível ler o arquivo CSV: ' + sanitizeErrorMessage(error))
        setLoading(false)
      }
    })
  }

  const handleImportarContatos = async () => {
    setErro(null)
    
    startTransition(async () => {
      try {
        const res = await importarContatos(pesquisaId, contatos)
        if (res.success) {
          setCountImportados(res.data?.count || contatos.length)
          setStep('DISPARO')
        } else {
          setErro(res.error?.message || 'Não foi possível preparar a lista de clientes.')
        }
      } catch (err: any) {
        setErro(sanitizeErrorMessage(err) || 'Ocorreu um problema inesperado ao preparar a lista de clientes.')
      }
    })
  }

  const handleDispararPesquisas = async () => {
    setErro(null)

    startTransition(async () => {
      try {
        const res = await processarDisparo(pesquisaId)
        if (res.success) {
          setStep('SUCESSO')
        } else {
          setErro(res.error?.message || 'Não foi possível iniciar os envios agora.')
        }
      } catch (err: any) {
        setErro(sanitizeErrorMessage(err) || 'Ocorreu um problema inesperado ao iniciar os envios.')
      }
    })
  }

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
            href={`/pesquisas/${pesquisaId}/envios`}
            className="bg-slate-900 border-2 border-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-slate-900/10"
          >
            Ver Histórico de Envios
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
          onClick={() => step === 'UPLOAD' ? router.push(`/pesquisas/${pesquisaId}`) : setStep('UPLOAD')}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fluxo de Envio</h1>
          <p className="text-sm text-gray-500 font-medium font-sans italic opacity-75">Siga as etapas para iniciar sua nova campanha.</p>
        </div>
      </div>

      {renderStepsHeader()}

      {step === 'UPLOAD' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center transition-all hover:border-indigo-300 group shadow-sm bg-gradient-to-b from-white to-gray-50/30">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-500 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              {loading ? <Loader2 size={40} className="animate-spin" /> : <Upload size={40} />}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Adicione sua lista de clientes</h3>
            <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium text-base">Prepare um arquivo CSV contendo as colunas <span className="text-gray-900 font-bold underline decoration-indigo-500 underline-offset-4">nome</span> e <span className="text-gray-900 font-bold underline decoration-indigo-500 underline-offset-4">email</span>.</p>
            
            <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-indigo-600/40 cursor-pointer inline-flex items-center gap-3 active:scale-95">
              <FileText size={24} />
              Enviar arquivo CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
            </label>

            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent('nome,email\nJoão da Silva,joao@empresa.com\nMaria Souza,maria@empresa.com')}`}
              download="modelo-contatos.csv"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-600 hover:text-indigo-700 hover:border-indigo-200 transition-all"
            >
              <Upload size={16} />
              Baixar modelo CSV
            </a>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Adicionar clientes manualmente</h3>
              <p className="text-sm text-gray-500 font-medium">Cadastre um ou mais clientes sem precisar de arquivo CSV.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome-manual" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nome</label>
                <input
                  id="nome-manual"
                  type="text"
                  value={nomeManual}
                  onChange={(e) => setNomeManual(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="email-manual" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">E-mail</label>
                <input
                  id="email-manual"
                  type="email"
                  value={emailManual}
                  onChange={(e) => setEmailManual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      adicionarContatoManual()
                    }
                  }}
                  placeholder="cliente@empresa.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <button
                type="button"
                onClick={adicionarContatoManual}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all inline-flex items-center justify-center gap-2"
              >
                <Users size={18} />
                Adicionar cliente
              </button>

              {contatos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStep('REVISAO')}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                >
                  Revisar lista com {contatos.length} cliente(s)
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Adicionar vários de uma vez</p>
              <textarea
                value={blocoManual}
                onChange={(e) => setBlocoManual(e.target.value)}
                placeholder={"Uma linha por cliente\nEx.: Maria Silva, maria@empresa.com\nEx.: joao@empresa.com"}
                className="w-full min-h-28 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-y"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={adicionarContatosEmBloco}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:border-indigo-200 hover:text-indigo-700 transition-all"
                >
                  Adicionar em lote
                </button>
                <p className="text-xs text-gray-400 font-medium">Use vírgula, ponto e vírgula ou tab para separar nome e e-mail.</p>
              </div>
            </div>

            {contatos.length > 0 && (
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Clientes na lista ({contatos.length})</p>
                <div className="max-h-44 overflow-y-auto space-y-2 custom-scrollbar">
                  {contatos.map((contato) => (
                    <div key={contato.email} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{contato.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{contato.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerContato(contato.email)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover cliente"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resumoImportacao && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-sm font-bold text-indigo-700">
                  Importação ({resumoImportacao.origem}): {resumoImportacao.adicionados} adicionados, {resumoImportacao.ignoradosInvalidos} com dados inválidos e {resumoImportacao.ignoradosDuplicados} que já estavam na lista.
                </p>
                {resumoImportacao.exemplosInvalidos.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Exemplos com dados inválidos</p>
                    <ul className="space-y-1">
                      {resumoImportacao.exemplosInvalidos.map((linha, index) => (
                        <li key={`${linha}-${index}`} className="text-xs font-medium text-indigo-700/90">
                          • {linha}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {resumoImportacao.exemplosDuplicados.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Exemplos já existentes na lista</p>
                    <ul className="space-y-1">
                      {resumoImportacao.exemplosDuplicados.map((linha, index) => (
                        <li key={`${linha}-duplicado-${index}`} className="text-xs font-medium text-indigo-700/90">
                          • {linha}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'REVISAO' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-400">
          <div className="px-8 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Revisão da lista</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{contatos.length} clientes prontos para envio</p>
              </div>
            </div>
            <button 
              onClick={() => { setContatos([]); setStep('UPLOAD'); }}
              className="text-gray-400 hover:text-red-500 p-2 bg-gray-50 rounded-xl transition-all"
              title="Limpar lista"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 sticky top-0 border-b border-gray-100 backdrop-blur-sm z-10">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-10 py-4">Nome do Cliente</th>
                  <th className="px-10 py-4">E-mail</th>
                  <th className="px-10 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contatos.slice(0, 50).map((c, i) => (
                  <tr key={i} className="text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-4 font-bold text-gray-700">{c.nome}</td>
                    <td className="px-10 py-4 text-gray-500 font-medium">{c.email}</td>
                    <td className="px-10 py-4 text-center">
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-amber-100">Pronto</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">Mostrando os primeiros {Math.min(contatos.length, 50)} de {contatos.length} clientes</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep('UPLOAD')}
                className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                disabled={isPending}
              >
                Editar Lista
              </button>
              <button 
                onClick={handleImportarContatos}
                disabled={isPending}
                className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center gap-2 group"
              >
                {isPending ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'DISPARO' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-12 text-center space-y-8 animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
             <SendHorizontal size={40} />
           </div>
           
           <div className="space-y-2">
             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tudo pronto para enviar?</h2>
             <p className="text-gray-500 font-medium max-w-sm mx-auto">
                Sua lista com <span className="text-indigo-600 font-bold">{countImportados} clientes</span> foi preparada com sucesso.
             </p>
           </div>

           <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-xs mx-auto flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-emerald-100">
                <Check size={14} /> Lista pronta
              </div>
              <p className="text-xs text-gray-400 font-medium italic">Após o envio, cada cliente recebe um link único de resposta.</p>
           </div>

           <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
              <button 
                onClick={handleDispararPesquisas}
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-3xl font-black text-lg transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 group disabled:cursor-not-allowed"
              >
                {isPending ? <Loader2 size={24} className="animate-spin" /> : <SendHorizontal size={24} />}
                {isPending ? 'Iniciando envios...' : `Enviar para ${countImportados} clientes`}
              </button>
              <button 
                onClick={() => setStep('REVISAO')}
                disabled={isPending}
                className="text-gray-400 hover:text-gray-600 font-bold transition-colors disabled:opacity-50"
              >
                Voltar para revisão
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
