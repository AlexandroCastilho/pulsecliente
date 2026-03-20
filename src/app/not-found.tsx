import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto">
          <FileQuestion className="w-10 h-10 text-indigo-500" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Erro 404</p>
          <h1 className="text-3xl font-black text-slate-900">Página não encontrada</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            A página que procura não existe ou foi movida para outro endereço.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-slate-900 transition-all active:scale-95"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  )
}
