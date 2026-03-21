"use client"

import { useState } from 'react'
import { X, Mail, SendHorizontal, Loader2, AlertCircle } from 'lucide-react'
import { editarEReenviarEnvio } from '@/actions/envios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { sanitizeErrorMessage } from '@/lib/error-handler'

interface EditResendModalProps {
  isOpen: boolean
  onClose: () => void
  envio: {
    id: string
    nomeDestinatario: string | null
    emailDestinatario: string
  }
}

export function EditResendModal({ isOpen, onClose, envio }: EditResendModalProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(envio.emailDestinatario)
  const router = useRouter()

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await editarEReenviarEnvio(envio.id, email)
      if (res.success) {
        toast.success("Envio atualizado com sucesso", {
          description: "O e-mail foi corrigido e a tentativa de envio foi iniciada."
        })
        router.refresh()
        onClose()
      } else {
        toast.error("Não foi possível concluir", {
          description: res.error?.message || "Não conseguimos atualizar este envio agora."
        })
      }
    } catch (err) {
      toast.error("Ocorreu um problema", {
        description: sanitizeErrorMessage(err),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Mail size={20} />
             </div>
             <h3 className="font-bold text-gray-900">Corrigir e Reenviar</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 text-blue-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              Corrija o e-mail de <strong>{envio.nomeDestinatario || 'seu cliente'}</strong> abaixo.
              Após confirmar, vamos tentar o envio novamente para esse cliente.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">E-mail do Cliente</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-bold text-xs transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <SendHorizontal size={18} />
                  Confirmar e Reenviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
