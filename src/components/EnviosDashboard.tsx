"use client"

import { useState, useEffect, useTransition } from 'react'
import { 
  Search, 
  Mail,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { StatusBadge } from './StatusBadge'
import { CopySurveyLink } from './CopySurveyLink'
import { EmptyState } from './EmptyState'
import { EditResendModal } from './EditResendModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusEnvio } from '@prisma/client'

interface EnvioStats {
  total: number
  respondidas: number
  taxaSucesso: number
  erros: number
}

interface Envio {
  id: string
  nomeDestinatario: string | null
  emailDestinatario: string
  createdAt: Date | string
  status: StatusEnvio
  token: string
  pesquisa: { titulo: string }
}

interface EnviosDashboardProps {
  historico: Envio[]
  stats: EnvioStats
  totalPages: number
}

export function EnviosDashboard({ historico, stats, totalPages }: EnviosDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [selectedEnvio, setSelectedEnvio] = useState<Envio | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  const currentPage = Number(searchParams.get('page')) || 1

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleEdit = (envio: Envio) => {
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
          label="Total de Envios" 
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
          label="Taxa de Entrega" 
          value={`${stats?.taxaSucesso || 0}%`} 
          icon={<CheckCircle2 className="text-blue-500" size={20} />} 
          color="bg-blue-50"
        />
        <StatCard 
          label="Falhas de Envio" 
          value={stats?.erros || 0} 
          icon={<AlertCircle className="text-red-500" size={20} />} 
          color="bg-red-50"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Histórico de Envios</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Últimos {historico.length} envios</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-gray-400 group-focus-within:text-indigo-500'}`} size={16} />
              <input 
                type="text" 
                placeholder="Buscar cliente por e-mail ou nome..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all w-64 text-gray-900"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          {historico.length > 0 ? (
            <>
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-gray-50/50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="w-[30%] px-4 py-4">Cliente</th>
                    <th className="w-[30%] px-4 py-4">Pesquisa</th>
                    <th className="w-[20%] px-4 py-4">Data do Envio</th>
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
                              title="Corrigir e reenviar"
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

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                      <ChevronLeft size={14} />
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                      Próxima
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12">
              <EmptyState 
                icon={<Mail size={40} />}
                title={searchTerm ? "Nenhum resultado encontrado" : "Ainda não há envios para esta pesquisa"}
                description={searchTerm ? `Não encontramos nenhum envio correspondente a "${searchTerm}".` : "Quando você iniciar os envios, o histórico aparecerá aqui para acompanhar resultados e corrigir falhas rapidamente."}
                actionLabel={searchTerm ? "Limpar Busca" : "Ir para Pesquisas"}
                actionHref={searchTerm ? pathname : "/pesquisas"}
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

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Atualizado</div>
      </div>
      <h4 className="text-sm font-bold text-gray-400 mb-1">{label}</h4>
      <div className="text-2xl font-black text-gray-900 tracking-tight">{value}</div>
    </div>
  )
}
