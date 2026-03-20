'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { reenviarEmailConfirmacao } from '@/actions/auth'
import { toast } from 'sonner'
import { useState, Suspense } from 'react'
import { Infinity as InfinityIcon, Mail, ArrowRight } from 'lucide-react'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    if (!email) {
      toast.error('E-mail não encontrado.')
      return
    }

    setIsResending(true)
    const result = await reenviarEmailConfirmacao(email)
    
    if (!result.success) {
      toast.error(result.error.message)
    } else {
      toast.success('E-mail de confirmação reenviado!')
    }
    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-inter">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200">
            <InfinityIcon className="text-white w-8 h-8" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Verifique seu e-mail
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enviamos um link de confirmação para {email ? <strong className="text-indigo-600">{email}</strong> : 'o seu endereço de e-mail'}.
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 md:py-10 md:px-8 shadow-2xl shadow-gray-200/60 sm:rounded-3xl border border-gray-100/50 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-indigo-600 w-8 h-8" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">Próximos passos</h3>
          <p className="text-gray-500 text-sm mb-8">
            Para ativar sua conta e acessar seu dashboard, clique no botão de confirmação que enviamos para você. Caso não encontre, verifique sua pasta de spam.
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all font-inter items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              Ir para o Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="text-xs text-gray-400">
              Não recebeu o e-mail?{' '}
              <button 
                onClick={handleResend}
                disabled={isResending}
                className="text-indigo-600 font-bold hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isResending ? 'Enviando...' : 'Reenviar confirmação'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
