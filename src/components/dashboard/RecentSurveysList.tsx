import prisma from '@/lib/prisma'
import Link from 'next/link'
import { MessageSquare, ChevronRight } from 'lucide-react'

export async function RecentSurveysList({ empresaId }: { empresaId: string }) {
  const pesquisas = await prisma.pesquisa.findMany({
    where: { empresaId },
    select: {
      id: true,
      titulo: true,
      createdAt: true,
      _count: {
        select: { envios: { where: { status: 'RESPONDIDO' } } }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900">Pesquisas Recentes</h3>
        <Link href="/pesquisas" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Ver todas</Link>
      </div>
      <div className="divide-y divide-gray-100">
        {pesquisas.length > 0 ? (
          pesquisas.map((p) => (
            <SurveyRow 
              key={p.id}
              id={p.id}
              title={p.titulo} 
              date={new Date(p.createdAt).toLocaleDateString('pt-BR')} 
              responses={p._count.envios} 
              status="Ativa" 
            />
          ))
        ) : (
          <div className="p-10 text-center">
            <p className="text-gray-400 text-sm font-medium">Nenhuma pesquisa criada ainda.</p>
            <Link href="/editor" className="text-indigo-600 text-xs font-bold mt-2 inline-block hover:underline">
              Criar minha primeira pesquisa
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function SurveyRow({ id, title, date, responses, status }: any) {
  return (
    <Link href={`/pesquisas/${id}`} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
          <MessageSquare size={18} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500 font-medium">{date} • {responses} respostas</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
          status === 'Ativa' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
        }`}>
          {status}
        </span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transform group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  )
}

export function SurveysSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-32"></div>
                <div className="h-3 bg-gray-50 rounded w-24"></div>
              </div>
            </div>
            <div className="w-20 h-6 bg-gray-50 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
