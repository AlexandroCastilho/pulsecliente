"use client"

import { useState } from 'react'
import { Calendar, Clock, Edit2 } from 'lucide-react'
import EditSurveyDatesModal from './EditSurveyDatesModal'

interface Props {
  pesquisaId: string
  dataInicio?: Date | string | null
  dataFim?: Date | string | null
  createdAt: Date | string
}

export default function SurveyDateHeader({ pesquisaId, dataInicio, dataFim, createdAt }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formattedCreated = new Date(createdAt).toLocaleDateString('pt-BR')
  const hasDates = dataInicio || dataFim

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest rounded-md border border-indigo-100 shadow-sm">Analytics</span>
          <span className="text-gray-300 hidden sm:inline">•</span>
          <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
            <Calendar size={12} className="text-gray-300" />
            Criada em {formattedCreated}
          </span>
        </div>

        {hasDates ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50/50 rounded-xl border border-indigo-100/50 group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-indigo-500 uppercase tracking-tighter">
              <Clock size={12} />
              {dataInicio ? new Date(dataInicio).toLocaleDateString('pt-BR') : 'Início imediato'} 
              <span className="mx-1 text-indigo-200">/</span>
              {dataFim ? new Date(dataFim).toLocaleDateString('pt-BR') : 'Sem prazo'}
            </div>
            <Edit2 size={10} className="text-indigo-300 group-hover:text-indigo-500 transition-colors" />
          </div>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-1.5 transition-colors group"
          >
            <Calendar size={12} className="group-hover:scale-110 transition-transform" />
            Definir Período
          </button>
        )}
      </div>

      {isModalOpen && (
        <EditSurveyDatesModal 
          pesquisaId={pesquisaId}
          initialDataInicio={dataInicio}
          initialDataFim={dataFim}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
