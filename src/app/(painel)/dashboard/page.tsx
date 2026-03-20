import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Activity } from 'lucide-react'

// Dashboard Components
import { DashboardStats, StatsSkeleton } from '@/components/dashboard/DashboardStats'
import { RecentSurveysList, SurveysSkeleton } from '@/components/dashboard/RecentSurveysList'
import { NpsGlobalScore } from '@/components/dashboard/NpsGlobalScore'
import { DispatchStatus, DispatchSkeleton } from '@/components/dashboard/DispatchStatus'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true, nome: true }
  })

  if (!dbUser) redirect('/login')

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard de Operações</h1>
          <p className="text-sm text-gray-500 font-medium">
            Bem-vindo de volta, {dbUser.nome.split(' ')[0]}! Veja o desempenho dos seus disparos.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
          <Activity size={18} className="text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest whitespace-nowrap">Status Geral</span>
        </div>
      </div>

      {/* Metrics Grid - 6 Cards + NPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats empresaId={dbUser.empresaId} />
          <Suspense fallback={<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-pulse h-40"></div>}>
             <NpsGlobalScore empresaId={dbUser.empresaId} />
          </Suspense>
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Surveys */}
        <Suspense fallback={<SurveysSkeleton />}>
          <RecentSurveysList empresaId={dbUser.empresaId} />
        </Suspense>

        {/* Dispatch Status */}
        <Suspense fallback={<DispatchSkeleton />}>
          <DispatchStatus empresaId={dbUser.empresaId} />
        </Suspense>
      </div>
    </div>
  )
}
