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

  const pesquisas = await prisma.pesquisa.findMany({
    where: { empresaId: dbUser.empresaId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Minhas Pesquisas</h1>
          <p className="text-sm text-gray-500 font-medium">Gerencie suas pesquisas e configure novos disparos.</p>
        </div>
        <Link 
          href="/editor" 
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Nova Pesquisa
        </Link>
      </div>

      {pesquisas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pesquisas.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                <Link href={`/pesquisas/${p.id}`} className="p-6 flex-1 block">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      p.ativa ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {p.ativa ? 'Ativa' : 'Inativa'}
                    </div>
                    <div className="text-gray-300 group-hover:text-indigo-200 transition-colors">
                      <BarChart3 size={20} />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {p.titulo}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      Acompanhar resultados
                    </div>
                  </div>
                </Link>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <Link 
                  href={`/envios?pesquisaId=${p.id}`}
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors group/btn"
                >
                  <Send size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  Configurar Disparo
                </Link>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <Plus size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sua lista está vazia</h2>
          <p className="text-gray-500 max-w-sm mb-8 font-medium">Você ainda não criou nenhuma pesquisa para sua empresa. Comece agora mesmo!</p>
          <Link 
            href="/editor" 
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-slate-900/10"
          >
            Criar Pesquisa
          </Link>
        </div>
      )}
    </div>
  )
}
