"use client"

import { useState } from 'react'
import { Calendar, Clock, Loader2, Save, X } from 'lucide-react'
import { atualizarDatasPesquisa } from '@/actions/pesquisas'
import { toast } from 'sonner'

interface Props {
  pesquisaId: string
  initialDataInicio?: Date | string | null
  initialDataFim?: Date | string | null
  onClose: () => void
}

export default function EditSurveyDatesModal({ pesquisaId, initialDataInicio, initialDataFim, onClose }: Props) {
  const [dataInicio, setDataInicio] = useState(initialDataInicio ? new Date(initialDataInicio).toISOString().split('T')[0] : '')
  const [dataFim, setDataFim] = useState(initialDataFim ? new Date(initialDataFim).toISOString().split('T')[0] : '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const res = await atualizarDatasPesquisa(pesquisaId, dataInicio, dataFim)
    setIsSaving(false)
    
    if (res.success) {
      toast.success("Datas atualizadas com sucesso!")
      onClose()
    } else {
      toast.error(res.error?.message || "Erro ao atualizar datas")
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Período de Validade</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Data de Início</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              </div>
              <p className="text-[11px] text-gray-400 italic font-medium pl-1">A pesquisa só aceitará respostas a partir desta data.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Data de Término</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700"
                />
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              </div>
              <p className="text-[11px] text-gray-400 italic font-medium pl-1">A pesquisa será movida para &ldquo;Finalizada&rdquo; após esta data.</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Salvando...' : 'Salvar Período'}
          </button>
        </div>
      </div>
    </div>
  )
}
