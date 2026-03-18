"use client"

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { AddMemberModal } from './AddMemberModal'

export function EquipeHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Equipe</h1>
          <p className="text-sm text-gray-500 font-medium">Visualize e gerencie os membros que têm acesso ao PulseCliente.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <UserPlus size={18} />
          Novo Membro
        </button>
      </div>

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
