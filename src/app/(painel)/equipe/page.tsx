"use client"

import { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  Mail,
  UserCheck,
  UserCog,
  User,
  ShieldAlert
} from 'lucide-react'
import { EquipeHeader } from '@/components/EquipeHeader'
import { MemberActions } from '@/components/MemberActions'
import { TableSkeleton } from '@/components/TableSkeleton'
import { toast } from 'sonner'

export default function EquipePage() {
  const [loading, setLoading] = useState(true)
  const [membros, setMembros] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function loadEquipe() {
      try {
        // Buscamos os dados via fetch para permitir o estado de loading no cliente
        // Nota: Criaremos uma API Route simples ou usaremos uma Server Action chamada no useEffect
        const response = await fetch('/api/equipe')
        if (!response.ok) throw new Error("Erro ao carregar equipe")
        const data = await response.json()
        setMembros(data.membros)
        setCurrentUser(data.user)
      } catch (error) {
        console.error(error)
        toast.error("Erro de conexão", {
          description: "Não foi possível carregar a lista de membros."
        })
      } finally {
        setLoading(false)
      }
    }
    loadEquipe()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 w-full bg-gray-50 rounded-3xl" />
        <TableSkeleton rows={6} cols={5} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <EquipeHeader />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-gray-400" />
            Membros da Organização
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {membros.length} Utilizadores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilizador</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Função</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {membros.map((membro) => (
                <tr key={membro.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                        membro.role === 'OWNER' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-white border-gray-100 text-gray-400'
                      }`}>
                        {membro.role === 'OWNER' ? <Shield size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {membro.nome}
                          {membro.id === currentUser?.id && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-[8px] font-black text-gray-400 rounded-md uppercase tracking-tighter">EU</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">PulseCliente Team</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-300" />
                      {membro.email}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                      membro.role === 'OWNER'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        : membro.role === 'ADMIN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {membro.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                       <span className={`w-2 h-2 rounded-full ring-4 ${membro.ativo ? 'bg-emerald-500 ring-emerald-50' : 'bg-red-500 ring-red-50'}`}></span>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${membro.ativo ? 'text-emerald-500' : 'text-red-500'}`}>
                          {membro.ativo ? 'Ativo' : 'Bloqueado'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <MemberActions 
                      memberId={membro.id} 
                      currentRole={membro.role} 
                      currentStatus={membro.ativo}
                      isSelf={membro.id === currentUser?.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard 
          icon={<ShieldAlert className="text-indigo-500" size={24} />}
          title="Owner" 
          desc="Controlo total da empresa e configurações críticas." 
          color="indigo" 
        />
        <RoleCard 
          icon={<Shield className="text-emerald-500" size={24} />}
          title="Admin" 
          desc="Gestão de pesquisas, disparos e membros da equipe." 
          color="emerald" 
        />
        <RoleCard 
          icon={<UserCog className="text-slate-400" size={24} />}
          title="Member" 
          desc="Acesso para visualização e edição básica de dados." 
          color="gray" 
        />
      </div>
    </div>
  )
}

function RoleCard({ title, desc, color, icon }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    gray: 'bg-white text-slate-600 border-slate-200'
  }
  return (
    <div className={`p-8 rounded-3xl border ${colors[color]} shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      <div className="mb-4 bg-white/50 w-fit p-3 rounded-2xl border border-white">
        {icon}
      </div>
      <h4 className="font-black text-gray-900 mb-2 uppercase tracking-widest text-xs">{title}</h4>
      <p className="text-xs font-medium opacity-80 leading-relaxed text-gray-500">{desc}</p>
    </div>
  )
}
