"use server"

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar dados dinâmicos para a Sidebar
  const dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { empresa: true }
  })

  // Se o usuário não existir no Prisma (mas estiver logado no Supabase), 
  // o dashboard/page.tsx cuidará do bootstrap. 
  // Por enquanto, passamos dados básicos ou nulos.
  
  const userData = dbUser ? {
    nome: dbUser.nome,
    email: dbUser.email,
    empresa: dbUser.empresa.nome,
    iniciais: dbUser.nome.charAt(0).toUpperCase()
  } : {
    nome: user.user_metadata.full_name || "Admin",
    email: user.email!,
    empresa: "Carregando...",
    iniciais: "A"
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={userData} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
