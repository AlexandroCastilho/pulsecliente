"use client"

import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type FeedbackType = 'error' | 'success' | 'warning' | 'info'

interface FeedbackAlertProps {
  type: FeedbackType
  title?: string
  message: string | React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const FEEDBACK_CONFIG: Record<FeedbackType, { icon: LucideIcon; bg: string; border: string; text: string; iconColor: string; accent: string }> = {
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    accent: 'bg-red-100',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    accent: 'bg-emerald-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    accent: 'bg-amber-100',
  },
  info: {
    icon: Info,
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-800',
    iconColor: 'text-indigo-500',
    accent: 'bg-indigo-100',
  },
}

export function FeedbackAlert({ type, title, message, action, className }: FeedbackAlertProps) {
  const config = FEEDBACK_CONFIG[type]
  const Icon = config.icon

  return (
    <div 
      role="alert" 
      className={cn(
        "flex gap-4 p-5 rounded-3xl border animate-in fade-in slide-in-from-top-2 duration-500",
        config.bg, 
        config.border, 
        className
      )}
    >
      <div className={cn("p-2 rounded-xl h-fit", config.accent)}>
        <Icon size={20} className={config.iconColor} />
      </div>
      
      <div className="flex-1 space-y-1">
        {title && <h4 className={cn("font-black text-sm uppercase tracking-widest", config.text)}>{title}</h4>}
        <div className={cn("text-sm font-bold leading-relaxed opacity-90", config.text)}>
          {message}
        </div>
        
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "mt-3 text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity",
              config.text
            )}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
