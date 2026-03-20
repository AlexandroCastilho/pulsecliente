'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registrarConta } from '@/actions/auth'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export default function CadastroForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function clientAction(formData: FormData) {
    startTransition(async () => {
      const email = formData.get('email') as string
      const result = await registrarConta(formData)
  
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.requiresVerification) {
        toast.info('Verifique seu e-mail para confirmar seu cadastro.')
        router.push(`/confirmar-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.success('Conta criada com sucesso!')
        router.push('/dashboard')
      }
    })
  }

  return (
    <form className="space-y-5" action={clientAction}>
      <div>
        <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1.5 font-inter">
          Seu Nome Completo
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          disabled={isPending}
          className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all md:text-sm text-base font-inter bg-gray-50/50 hover:bg-white focus:bg-white"
          placeholder="Ex: Alexandre Castilho"
        />
      </div>

      <div>
        <label htmlFor="empresa" className="block text-sm font-semibold text-gray-700 mb-1.5 font-inter">
          Nome da Empresa
        </label>
        <input
          id="empresa"
          name="empresa"
          type="text"
          required
          disabled={isPending}
          className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all md:text-sm text-base font-inter bg-gray-50/50 hover:bg-white focus:bg-white"
          placeholder="Ex: Minha Pizzaria"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 font-inter">
          E-mail de Trabalho
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all md:text-sm text-base font-inter bg-gray-50/50 hover:bg-white focus:bg-white"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" senior-title-color="text-indigo-600" className="block text-sm font-semibold text-gray-700 mb-1.5 font-inter">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          disabled={isPending}
          className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm font-inter bg-gray-50/50 hover:bg-white focus:bg-white"
          placeholder="Mínimo de 6 caracteres"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all font-inter items-center gap-2 ${
            isPending ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:scale-[1.02] active:scale-95'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Criando Ambiente...</span>
            </>
          ) : (
            'Criar Minha Conta Grátis'
          )}
        </button>
      </div>

      <div className="pt-4 text-center">
        <Link 
          href="/login" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors font-inter flex items-center justify-center gap-1 group"
        >
          Já tem uma conta? <span className="underline decoration-indigo-200 group-hover:decoration-indigo-600">Faça Login</span>
        </Link>
      </div>
    </form>
  )
}
