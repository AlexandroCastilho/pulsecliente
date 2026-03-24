"use client"

import { useState, Fragment } from 'react'
import { Prisma } from '@prisma/client'
import { 
  User, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Star,
  Hash,
  BarChart3,
  List
} from 'lucide-react'
import { formatDate, getNPSColor } from '@/lib/utils'
import { CopySurveyLink } from '@/components/CopySurveyLink'

interface Pergunta {
  id: string
  titulo: string
  tipo: string
}

interface Envio {
  id: string
  nomeDestinatario: string | null
  emailDestinatario: string
  status: string
  token: string
  createdAt: Date
  enviadoEm: Date | null
  resposta?: {
    dados: Prisma.JsonValue
    respondidoEm: Date
  } | null
}

interface Props {
  envios: Envio[]
  perguntas: Pergunta[]
}

export function SurveyResponseTable({ envios, perguntas }: Props) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getRespostaFormatada = (pergunta: Pergunta, resposta: unknown) => {
    if (resposta === undefined || resposta === null) return <span className="text-gray-300 italic">Não respondida</span>
    
    switch (pergunta.tipo) {
      case 'ESCALA_NPS':
        return (
          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-bold text-xs border ${getNPSColor(Number(resposta))}`}>
            {String(resposta)}
          </span>
        )
      case 'ESTRELAS':
        return (
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            {String(resposta)} <Star size={12} fill="currentColor" />
          </div>
        )
      default:
        return <span className="text-gray-700 font-medium">{String(resposta)}</span>
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Respostas Individuais</h3>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{envios.length} Envios Totais</span>
      </div>
      
      <div className="w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="w-10 px-4 py-4 text-center"></th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
              <th className="w-24 px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="w-32 px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data</th>
              <th className="w-20 px-4 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {envios.map((envio) => {
              const isExpanded = expandedRows[envio.id]
              const hasResposta = !!envio.resposta
              
              return (
                <Fragment key={envio.id}>
                  <tr 
                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer group ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => hasResposta && toggleRow(envio.id)}
                  >
                    <td className="px-4 text-center">
                      {hasResposta && (
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-gray-300'}`}>
                          <ChevronDown size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-50 shrink-0">
                          <User size={18} />
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <div className="text-sm font-bold text-gray-900 leading-tight truncate">{envio.nomeDestinatario || 'Sem nome'}</div>
                          <div className="text-[11px] text-gray-400 font-medium truncate" title={envio.emailDestinatario}>{envio.emailDestinatario}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center overflow-hidden">
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border flex items-center justify-center gap-1.5 w-fit ${
                          envio.status === 'RESPONDIDO' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : envio.status === 'ERRO'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {envio.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-500 text-center truncate overflow-hidden">
                      {formatDate(envio.enviadoEm || envio.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CopySurveyLink token={envio.token} status={envio.status} />
                    </td>
                  </tr>
                  
                  {isExpanded && hasResposta && (
                    <tr className="bg-indigo-50/20">
                      <td colSpan={5} className="px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                          {perguntas.map((pergunta) => (
                            <div key={pergunta.id} className="space-y-2 p-4 bg-white rounded-2xl border border-indigo-100/50 shadow-sm">
                              <div className="flex items-start gap-2">
                                <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
                                  {pergunta.tipo === 'ESCALA_NPS' ? <BarChart3 size={14} /> : 
                                   pergunta.tipo === 'ESTRELAS' ? <Star size={14} /> :
                                   pergunta.tipo === 'MULTIPLA_ESCOLHA' ? <List size={14} /> :
                                   <MessageSquare size={14} />}
                                </div>
                                <span className="text-xs font-bold text-gray-500 leading-tight">{pergunta.titulo}</span>
                              </div>
                              <div className="text-sm pl-8">
                                {getRespostaFormatada(pergunta, (envio.resposta?.dados as Record<string, unknown>)?.[pergunta.id])}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {envios.length === 0 && (
        <div className="p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <User size={32} />
          </div>
          <p className="text-gray-400 font-medium font-inter">Nenhum envio realizado.</p>
        </div>
      )}
    </div>
  )
}
