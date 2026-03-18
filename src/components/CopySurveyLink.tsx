"use client"

import { useState } from 'react'
import { Copy, Check, MessageSquare } from 'lucide-react'

interface CopySurveyLinkProps {
  token: string
  status: string
}

export function CopySurveyLink({ token, status }: CopySurveyLinkProps) {
  const [copied, setCopied] = useState(false)
  const isRespondido = status === 'RESPONDIDO'
  
  // Constrói a URL absoluta baseada no window.location
  const getSurveyUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/responder/${token}`
  }

  const handleCopy = async () => {
    if (isRespondido) return
    
    try {
      await navigator.clipboard.writeText(getSurveyUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar link:', err)
    }
  }

  return (
    <div className="relative group inline-block">
      <button
        onClick={handleCopy}
        disabled={isRespondido}
        className={`p-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
          isRespondido
            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60'
            : copied
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : 'bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm border-gray-200'
        }`}
      >
        {isRespondido ? (
          <MessageSquare size={18} />
        ) : copied ? (
          <Check size={18} />
        ) : (
          <Copy size={18} />
        )}
        
        {copied && <span className="text-[10px] font-bold pr-1">COPIADO!</span>}
      </button>

      {/* Tooltip de "Já Respondido" */}
      {isRespondido && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30">
          Cliente já respondeu a pesquisa.
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}

      {/* Tooltip de "Copia Link" */}
      {!isRespondido && !copied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30">
          Gerar Link Manual
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-indigo-600" />
        </div>
      )}
    </div>
  )
}
