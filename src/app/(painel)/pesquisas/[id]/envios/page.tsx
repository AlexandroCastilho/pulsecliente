import { Suspense } from 'react'
import { Loader2, ArrowLeft, Send } from 'lucide-react'
import { EnviosWizard } from '@/components/EnviosWizard'
import { EnviosDashboard } from '@/components/EnviosDashboard'
import { getHistoricoEnvios, getStatsEnvios } from '@/actions/envios'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function PesquisaEnviosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pesquisaId } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  })

  // Validar se a pesquisa existe e pertence à empresa
  const pesquisa = await prisma.pesquisa.findFirst({
    where: { 
      id: pesquisaId,
      empresaId: dbUser?.empresaId 
    },
    select: { titulo: true }
  })

  if (!pesquisa) notFound()

  // Busca dados para o Dashboard usando o pesquisaId
  const [historico, stats] = await Promise.all([
    getHistoricoEnvios(pesquisaId),
    getStatsEnvios(pesquisaId)
  ])

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20 font-inter animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href={`/pesquisas/${pesquisaId}`}
            className="p-2.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-2xl transition-all text-gray-400 hover:text-gray-900 group"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-100">Disparos</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-400 font-bold truncate max-w-[200px]">{pesquisa.titulo}</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Gestão de Envios</h1>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-none">Novo Envio</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Importe contatos e inicie disparos</p>
            </div>
          </div>
          <EnviosWizard pesquisaId={pesquisaId} />
        </section>

        <section>
          <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>}>
            <EnviosDashboard historico={historico} stats={stats} />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
