"use server"

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardWrapper } from '@/components/DashboardWrapper'

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

  // 1. Verificar ou Criar Usuário (Auto-Bootstrap)
  let dbUser = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { empresa: true }
  })

  if (!dbUser) {
    // Criar empresa padrão e usuário OWNER
    const empresa = await prisma.empresa.create({
      data: {
        nome: "Minha Empresa",
        slug: "org-123456"
      }
    })

    dbUser = await prisma.usuario.create({
      data: {
        id: user.id,
        email: user.email!,
        nome: user.user_metadata?.full_name || "Membro",
        role: "OWNER",
        empresaId: empresa.id
      },
      include: { empresa: true }
    })
  }

  const userData = {
    nome: dbUser.nome,
    email: dbUser.email,
    empresa: dbUser.empresa.nome,
    iniciais: dbUser.nome.charAt(0).toUpperCase()
  }

  return (
    <DashboardWrapper userData={userData}>
      {children}
    </DashboardWrapper>
  )
}
