import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Send
} from 'lucide-react'
import { StatusEnvio } from '@prisma/client'

interface StatusBadgeProps {
  status: StatusEnvio
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs = {
    PENDENTE: {
      label: 'Aguardando envio',
      shortLabel: 'Aguardando',
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: <Clock size={12} />
    },
    PROCESSANDO: {
      label: 'Enviando',
      shortLabel: 'Enviando',
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      icon: <Send size={12} className="animate-pulse" />
    },
    ENVIADO: {
      label: 'Enviado',
      shortLabel: 'Enviado',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      icon: <Send size={12} />
    },
    ERRO: {
      label: 'Falha no envio',
      shortLabel: 'Falha',
      color: 'bg-red-50 text-red-700 border-red-100',
      icon: <AlertCircle size={12} />
    },
    RESPONDIDO: {
      label: 'Respondido',
      shortLabel: 'Respondido',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: <MessageSquare size={12} />
    },
    EXPIRADO: {
      label: 'Link expirado',
      shortLabel: 'Expirado',
      color: 'bg-gray-50 text-gray-700 border-gray-100',
      icon: <AlertCircle size={12} />
    }
  }

  const config = configs[status] || configs.PENDENTE

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${config.color}`}>
      {config.icon}
      <span className="sm:hidden">{config.shortLabel}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  )
}
