"use client"

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ExternalLink,
  Mail,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  Send,
  Edit2
} from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { CopySurveyLink } from './CopySurveyLink'
import { EmptyState } from './EmptyState'
import { EditResendModal } from './EditResendModal'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EnviosDashboardProps {
  historico: any[]
  stats: any
}

export function EnviosDashboard({ historico, stats }: EnviosDashboardProps) {
  const [selectedEnvio, setSelectedEnvio] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEdit = (envio: any) => {
    setSelectedEnvio(envio)
    setIsModalOpen(true)
  }

  const formatDateSafely = (date: Date | string) => {
    if (!mounted) return '...'
    try {
      return format(new Date(date), "dd 'de' MMM, HH:mm", { locale: ptBR })
    } catch (e) {
      return 'Data inválida'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total de Disparos" 
          value={stats?.total || 0} 
          icon={<Send className="text-indigo-500" size={20} />} 
          color="bg-indigo-50"
        />
        <StatCard 
          label="Respondidos" 
          value={stats?.respondidas || 0} 
          icon={<MessageSquare className="text-emerald-500" size={20} />} 
          color="bg-emerald-50"
        />
        <StatCard 
          label="Taxa de Entregabilidade" 
          value={`${stats?.taxaSucesso || 0}%`} 
          icon={<CheckCircle2 className="text-blue-500" size={20} />} 
          color="bg-blue-50"
        />
        <StatCard 
          label="Erros / Falhas" 
          value={stats?.erros || 0} 
          icon={<AlertCircle className="text-red-500" size={20} />} 
          color="bg-red-50"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Histórico de Disparos</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Últimos {historico.length} registros</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por e-mail..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all w-64 text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          {historico.length > 0 ? (
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="w-[30%] px-4 py-4">Destinatário</th>
                  <th className="w-[30%] px-4 py-4">Pesquisa</th>
                  <th className="w-[20%] px-4 py-4">Data de Envio</th>
                  <th className="w-[12%] px-4 py-4 text-center">Status</th>
                  <th className="w-[8%] px-4 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historico.map((envio) => (
                  <tr key={envio.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-5 overflow-hidden">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-900 truncate">{envio.nomeDestinatario || 'Sem nome'}</span>
                        <span className="text-xs text-gray-400 font-medium truncate">{envio.emailDestinatario}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                          <Mail size={14} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 truncate">{envio.pesquisa.titulo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-medium text-gray-500 truncate">
                      {formatDateSafely(envio.createdAt)}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={envio.status} />
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex justify-center gap-2">
                         {envio.status === 'ERRO' && (
                           <button 
                             onClick={() => handleEdit(envio)}
                             className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                             title="Editar e Reenviar"
                           >
                             <Edit2 size={16} />
                           </button>
                         )}
                         <CopySurveyLink token={envio.token} status={envio.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
              <EmptyState 
                icon={<Mail size={40} />}
                title="Sua lista de disparos está vazia"
                description="Você ainda não realizou nenhum disparo para seus clientes. Selecione uma pesquisa e comece a coletar feedbacks agora mesmo!"
                actionLabel="Selecionar Pesquisa"
                actionHref="/pesquisas"
              />
            </div>
          )}
        </div>
      </div>

      {selectedEnvio && (
        <EditResendModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedEnvio(null); }} 
          envio={selectedEnvio} 
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tempo Real</div>
      </div>
      <h4 className="text-sm font-bold text-gray-400 mb-1">{label}</h4>
      <div className="text-2xl font-black text-gray-900 tracking-tight">{value}</div>
    </div>
  )
}
