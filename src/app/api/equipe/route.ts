import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import prisma from '@/lib/prisma'
import { sanitizeErrorMessage } from '@/lib/error-handler'

type MembroPayload = {
  id: string
  nome: string
  email: string
  role: string
  ativo: boolean
  createdAt: Date
}

type ConvitePayload = {
  id: string
  nome: string
  email: string
  role: string
  status: string
  empresaId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  token: string
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    const membrosRaw: MembroPayload[] = await prisma.usuario.findMany({
      where: { empresaId: user.empresaId },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true
      }
    })

    const isGestor = ['OWNER', 'ADMIN'].includes(user.role)

    let convites: ConvitePayload[] | null = null
    let membrosRes: MembroPayload[] = membrosRaw

    if (isGestor) {
      convites = await prisma.convite.findMany({
        where: {
          empresaId: user.empresaId,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      }) as ConvitePayload[]
    } else {
      membrosRes = membrosRaw.map((membro) => ({
        id: membro.id,
        nome: membro.nome,
        role: membro.role,
        ativo: membro.ativo,
        email: membro.email,
        createdAt: membro.createdAt
      }))
    }

    return NextResponse.json({
      user: {
        id: user.id,
        role: user.role,
        empresaId: user.empresaId
      },
      membros: membrosRes,
      convites
    })
  } catch (error) {
    console.error('[API EQUIPE ERROR]', error)
    return NextResponse.json(
      { error: sanitizeErrorMessage(error, { strict: true }) },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
