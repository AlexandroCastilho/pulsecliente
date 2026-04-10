'use client'

import { Calendar, BarChart3, Send, ChevronRight, Clock } from 'lucide-react'
import { DeleteSurveyButton } from '@/components/DeleteSurveyButton'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface SurveyCardProps {
  pesquisa: {
    id: string
    titulo: string
    ativa: boolean
    dataInicio: Date | null
    dataFim: Date | null
    createdAt: Date
  }
}

export function SurveyCard({ pesquisa: p }: SurveyCardProps) {
  const router = useRouter()
  const now = new Date()
  const isExpirada = p.dataFim && new Date(p.dataFim) < now
  const statusLabel = isExpirada ? 'Finalizada' : (p.ativa ? 'Ativa' : 'Inativa')
  const statusColor = isExpirada 
    ? 'bg-red-50 text-red-700 border border-red-100' 
    : p.ativa 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
      : 'bg-gray-100 text-gray-600 border border-gray-200'

  const handleCardClick = () => {
    router.push(`/pesquisas/${p.id}`)
  }

  return (
    <div 
      onClick={handleCardClick}
      className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col hover:-translate-y-1 duration-300 focus-within:ring-2 focus-within:ring-indigo-500 active:scale-[0.98] cursor-pointer"
    >
      {/* Botão de Excluir - z-20 para ficar acima do clique do card */}
      <div className="absolute top-6 right-6 z-20" onClick={(e) => e.stopPropagation()}>
        <DeleteSurveyButton surveyId={p.id} />
      </div>

      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-6 pr-10">
          <div className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${statusColor}`}>
            {statusLabel}
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <BarChart3 size={20} />
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
          {p.titulo}
        </h3>
        
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-none">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {new Date(p.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {(p.dataInicio || p.dataFim) && (
            <div className="flex items-center gap-1.5 text-[11px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 mt-2">
              <Clock size={12} />
              {p.dataInicio ? new Date(p.dataInicio).toLocaleDateString('pt-BR') : 'Início imediato'} 
              <span className="mx-1 text-indigo-300 inline-block">/</span>
              {p.dataFim ? new Date(p.dataFim).toLocaleDateString('pt-BR') : 'Sem prazo'}
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
        <div onClick={(e) => e.stopPropagation()} className="z-30">
          <Button 
            href={`/pesquisas/${p.id}/envios`}
            variant="secondary"
            size="sm"
            icon={<Send size={14} />}
            className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 font-black uppercase tracking-widest text-[11px] shadow-none"
          >
            Configurar Disparo
          </Button>
        </div>
        <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  )
}
