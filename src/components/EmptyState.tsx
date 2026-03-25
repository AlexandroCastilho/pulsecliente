"use client"

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionHref 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100"
    >
      <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-500 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionHref && actionLabel && (
        <Button href={actionHref} size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
