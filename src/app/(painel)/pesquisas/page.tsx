import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Calendar, 
  ChevronRight, 
  Send,
  BarChart3,
  Clock
} from 'lucide-react'
import { DeleteSurveyButton } from '@/components/DeleteSurveyButton'
import { EmptyState } from '@/components/EmptyState'

export default async function PesquisasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  })

  if (!dbUser) {
    redirect('/dashboard')
  }

  // Usamos queryRaw para evitar erros de esquema quando o Prisma Client local está desatualizado
  const pesquisas: any[] = await prisma.$queryRaw`
    SELECT p.*, 
      (SELECT COUNT(*)::int FROM envios e WHERE e."pesquisaId" = p.id AND e.status = 'RESPONDIDO') as "envios_count"
    FROM pesquisas p
    WHERE p."empresaId" = ${dbUser.empresaId}
    ORDER BY p."createdAt" DESC
  `

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Minhas Pesquisas</h1>
          <p className="text-sm text-gray-500 font-medium">Gerencie suas pesquisas e configure novos disparos.</p>
        </div>
        <Link 
          href="/editor" 
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <Plus size={20} />
          Nova Pesquisa
        </Link>
      </div>

      {pesquisas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pesquisas.map((pBase: any) => {
            const p = pBase as any
            const now = new Date()
            const isExpirada = p.dataFim && new Date(p.dataFim) < now
            const statusLabel = isExpirada ? 'Finalizada' : (p.ativa ? 'Ativa' : 'Inativa')
            const statusColor = isExpirada 
              ? 'bg-red-50 text-red-700 border border-red-100' 
              : p.ativa 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'

            return (
              <div key={p.id} className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col hover:-translate-y-1 duration-300">
                  {/* Botão de Excluir */}
                  <div className="absolute top-6 right-6 z-20">
                    <DeleteSurveyButton surveyId={p.id} surveyTitle={p.titulo} />
                  </div>

                  <Link href={`/pesquisas/${p.id}`} className="p-8 flex-1 block">
                    <div className="flex justify-between items-start mb-6 pr-10">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
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
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-300" />
                          {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      {(p.dataInicio || p.dataFim) && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-tighter bg-indigo-50/50 w-fit px-2 py-0.5 rounded-md border border-indigo-100/50">
                          <Clock size={12} />
                          {p.dataInicio ? new Date(p.dataInicio).toLocaleDateString('pt-BR') : 'Início imediato'} 
                          <span className="mx-1 text-indigo-200">/</span>
                          {p.dataFim ? new Date(p.dataFim).toLocaleDateString('pt-BR') : 'Sem prazo'}
                        </div>
                      )}
                    </div>
                  </Link>

                <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <Link 
                    href={`/pesquisas/${p.id}/envios`}
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest text-[10px] transition-colors group/btn"
                  >
                    <Send size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    Configurar Disparo
                  </Link>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState 
          icon={<Plus size={40} />}
          title="Sua lista de pesquisas está vazia"
          description="Você ainda não criou nenhuma pesquisa. Comece agora para ouvir seus clientes e tomar decisões baseadas em dados!"
          actionLabel="Criar Primeira Pesquisa"
          actionHref="/editor"
        />
      )}
    </div>
  )
}
