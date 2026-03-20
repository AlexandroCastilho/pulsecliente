"use client"

import { useState, useEffect, useTransition, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { validarTokenConvite, finalizarAceiteConvite } from '@/actions/auth'
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'

function AceitarConviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [isPending, startTransition] = useTransition()
  const [loadingToken, setLoadingToken] = useState(!!token)
  const [convite, setConvite] = useState<any>(null)
  const [erroToken, setErroToken] = useState<string | null>(null)
  
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!token) return

    async function validar() {
      const res = await validarTokenConvite(token!) as any
      if (!res.success) {
        setErroToken(res.error.message)
      } else {
        setConvite(res.data)
      }
      setLoadingToken(false)
    }
    validar()
  }, [token])

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem")
      return
    }
    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    startTransition(async () => {
      const res = await finalizarAceiteConvite(token!, senha) as any
      if (!res.success) {
        toast.error(res.error.message)
      } else {
        setSucesso(true)
        toast.success("Convite aceito com sucesso!")
        setTimeout(() => router.push('/login'), 3000)
      }
    })
  }

  if (loadingToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-gray-500 font-medium">Validando seu convite...</p>
      </div>
    )
  }

  if (!token || erroToken) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ops! Algo deu errado</h1>
          <p className="text-gray-500 mt-2">{!token ? "Token não fornecido." : erroToken}</p>
        </div>
        <button 
          onClick={() => router.push('/login')}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-black"
        >
          Ir para o Login
        </button>
      </div>
    )
  }

  if (sucesso) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center space-y-6 max-w-md mx-auto animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo(a)!</h1>
          <p className="text-gray-500 font-medium mt-2">Sua conta foi criada com sucesso. Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg mx-auto border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-10">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Você foi convidado!</h1>
        <p className="text-gray-500 font-medium">
          Olá <span className="text-indigo-600 font-bold">{convite?.nome}</span>, finalize seu cadastro na empresa <span className="text-gray-900 font-bold">{convite?.empresa?.nome}</span>.
        </p>
      </div>

      <form onSubmit={handleAccept} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">E-mail</label>
          <input 
            type="text" 
            value={convite?.email} 
            disabled 
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-400 font-bold cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Defina sua Senha</label>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type={showSenha ? "text" : "password"} 
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-gray-900 font-bold outline-none transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowSenha(!showSenha)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Confirme a Senha</label>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type={showSenha ? "text" : "password"} 
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita sua senha"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-gray-900 font-bold outline-none transition-all"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : "Finalizar Cadastro"}
        </button>
      </form>
    </div>
  )
}

export default function AceitarConvitePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6 font-inter">
      <Suspense fallback={<div>Carregando...</div>}>
        <AceitarConviteContent />
      </Suspense>
    </div>
  )
}
