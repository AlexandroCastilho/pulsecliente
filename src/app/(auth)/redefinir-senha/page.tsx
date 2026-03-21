'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { redefinirSenha } from '@/actions/auth'
import { Infinity, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeErrorMessage } from '@/lib/error-handler'

export default function RedefinirSenhaPage() {
  const [status, setStatus] = useState<'verifying' | 'idle' | 'loading'>('verifying')
  const [error, setError] = useState<string | null>(null)
  const [isRecoveryReady, setIsRecoveryReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function prepareRecoverySession() {
      const supabase = createClient()
      const searchParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

      try {
        const code = searchParams.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error

          if (isMounted) {
            setIsRecoveryReady(true)
            setStatus('idle')
            window.history.replaceState({}, document.title, window.location.pathname)
          }
          return
        }

        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error

          if (isMounted) {
            setIsRecoveryReady(true)
            setStatus('idle')
            window.history.replaceState({}, document.title, window.location.pathname)
          }
          return
        }

        const { data } = await supabase.auth.getSession()
        if (data.session) {
          if (isMounted) {
            setIsRecoveryReady(true)
            setStatus('idle')
          }
          return
        }

        if (isMounted) {
          setError('O link de redefinição é inválido ou expirou. Solicite um novo e-mail.')
          setStatus('idle')
        }
      } catch (error) {
        if (isMounted) {
          setError(sanitizeErrorMessage(error))
          setStatus('idle')
        }
      }
    }

    prepareRecoverySession()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isRecoveryReady) {
      setError('O link de redefinição é inválido ou expirou. Solicite um novo e-mail.')
      return
    }

    setStatus('loading')
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await redefinirSenha(formData)

    if (!result.success) {
      setError(result.error.message)
      setStatus('idle')
    }
    // Em caso de sucesso, a action faz redirect para /login
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center gap-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Infinity className="text-white w-6 h-6" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Nova Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escolha uma senha segura para a sua conta
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </label>
              <div className="mt-1">
                <input
                  id="confirmation"
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'verifying' || !isRecoveryReady}
              className={`w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                status === 'loading' || status === 'verifying' || !isRecoveryReady ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <KeyRound className="w-4 h-4" />
              {status === 'verifying' ? 'Validando link...' : status === 'loading' ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Cancelar e voltar ao Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
