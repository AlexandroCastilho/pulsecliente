import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import {
  Users,
  Shield,
  UserPlus,
  Mail,
  MoreVertical,
  UserCheck,
  UserCog,
  User
} from 'lucide-react'

export default async function EquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  })

  if (!dbUser) redirect('/dashboard')

  // Buscar todos os membros da mesma empresa
  const membros = await prisma.usuario.findMany({
    where: { empresaId: dbUser.empresaId },
    orderBy: { createdAt: 'asc' }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Equipe</h1>
            <p className="text-sm text-gray-500 font-medium">Visualize e gerencie os membros que têm acesso ao PulseCliente.</p>
        </div>

        <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50">
          <UserPlus size={20} />
          Convidar Membro
        </button>
      </div>

      {/* Tabela de Equipe */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-gray-400" />
            Membros Ativos
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{membros.length} Utilizadores</span>
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
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-50 shadow-sm">
                        <User size={20} />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{membro.nome}</div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-300" />
                      {membro.email}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${membro.role === 'OWNER'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        : membro.role === 'ADMIN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                      {membro.role === 'OWNER' ? <Shield size={12} /> : membro.role === 'ADMIN' ? <UserCheck size={12} /> : <UserCog size={12} />}
                      {membro.role}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-4 ring-emerald-50"></span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloco Informativo de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard title="Owner" desc="Controlo total da empresa e configurações de faturação." color="indigo" />
        <RoleCard title="Admin" desc="Pode criar pesquisas, disparar envios e gerir a equipe." color="emerald" />
        <RoleCard title="Member" desc="Acesso limitado a ver resultados e editar pesquisas." color="gray" />
      </div>
    </div>
  )
}

function RoleCard({ title, desc, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  }
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} shadow-sm`}>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-xs font-medium opacity-80 leading-relaxed">{desc}</p>
    </div>
  )
}
