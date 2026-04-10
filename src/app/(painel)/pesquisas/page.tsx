import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'

import { SurveyGrid, GridSkeleton } from '@/components/dashboard/SurveyGrid'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Minhas Pesquisas</h1>
          <p className="text-sm text-gray-500 font-medium">Gerencie suas pesquisas e configure novos disparos.</p>
        </div>
        <Button 
          href="/editor" 
          icon={<Plus size={20} />}
          size="md"
        >
          Nova Pesquisa
        </Button>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <PesquisaContent empresaId={dbUser.empresaId} />
      </Suspense>
    </div>
  )
}

async function PesquisaContent({ empresaId }: { empresaId: string }) {
  // Verificamos se há pesquisas primeiro para decidir entre Grid ou EmptyState
  const count = await prisma.pesquisa.count({ where: { empresaId } })
  
  if (count === 0) {
    return (
      <EmptyState 
        icon={<Plus size={40} />}
        title="Sua lista de pesquisas está vazia"
        description="Você ainda não criou nenhuma pesquisa. Comece agora para ouvir seus clientes e tomar decisões baseadas em dados!"
        actionLabel="Criar Primeira Pesquisa"
        actionHref="/editor"
      />
    )
  }

  return <SurveyGrid empresaId={empresaId} />
}
