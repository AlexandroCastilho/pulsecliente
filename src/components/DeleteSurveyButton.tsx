'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { excluirPesquisa } from '@/actions/pesquisas'
import { useRouter } from 'next/navigation'

interface DeleteSurveyButtonProps {
  surveyId: string
  surveyTitle: string
  redirectToList?: boolean
  variant?: 'icon' | 'full'
}

export function DeleteSurveyButton({ 
  surveyId, 
  surveyTitle, 
  redirectToList = false,
  variant = 'icon'
}: DeleteSurveyButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (isDeleting || isPending) return
    
    setIsDeleting(true)
    try {
      const result = await excluirPesquisa(surveyId)
      if (result.success) {
        setIsSuccess(true)
        
        startTransition(() => {
          if (redirectToList) {
            router.push('/pesquisas')
          }
          router.refresh()
        })
      } else {
        alert(result.message || 'Erro ao excluir a pesquisa.')
        setIsConfirming(false)
        setIsDeleting(false)
      }
    } catch (error) {
      alert('Ocorreu um erro inesperado.')
      setIsConfirming(false)
      setIsDeleting(false)
    } finally {
        // Não resetamos isDeleting aqui se sucesso, para não piscar o botão
        if (!isSuccess) setIsDeleting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in zoom-in slide-in-from-right-4 duration-500">
        <span className="text-[10px] font-black uppercase tracking-widest">Excluído</span>
        <div className="p-2 bg-emerald-50 rounded-lg">
          <Loader2 size={16} className="animate-spin" />
        </div>
      </div>
    )
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
        <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight hidden sm:inline">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-lg shadow-red-500/20 flex items-center gap-2 disabled:opacity-50 active:scale-90"
          title="Confirmar exclusão"
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          className="p-2 bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 border border-gray-100 rounded-lg transition-all text-xs font-bold disabled:opacity-50 active:scale-90"
        >
          Sair
        </button>
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <button
        onClick={() => setIsConfirming(true)}
        className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 active:scale-95"
      >
        <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
        <span>Excluir Pesquisa</span>
      </button>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsConfirming(true)
      }}
      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all hover:rotate-6 active:scale-75"
      title="Excluir pesquisa"
    >
      <Trash2 size={18} />
    </button>
  )
}
