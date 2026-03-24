'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest text-red-500">Algo correu mal</p>
          <h1 className="text-3xl font-black text-slate-900">Erro inesperado</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Ocorreu um erro ao carregar esta página. Pode tentar novamente ou voltar ao início.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}
