import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, empresaId: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const membros = await prisma.usuario.findMany({
      where: { empresaId: dbUser.empresaId },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({
      user: dbUser,
      membros
    })
  } catch (error) {
    console.error('[API EQUIPE ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
