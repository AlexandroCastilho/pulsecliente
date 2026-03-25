import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-guard'
import prisma from '@/lib/prisma'
import { sanitizeErrorMessage } from '@/lib/error-handler'

export async function GET() {
  try {
    // 1. Verificação de Autenticação e Perfil Ativo (Hardening)
    // getAuthenticatedUser já valida sessão, existência no DB e status ativo.
    const user = await getAuthenticatedUser()

    // 2. Busca de Membros (Base)
    const membrosRaw = await prisma.usuario.findMany({
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

    // 3. Lógica de Controle de Acesso por Role (RBAC)
    // OWNER e ADMIN veem tudo. MEMBER tem payload reduzido.
    const isGestor = ['OWNER', 'ADMIN'].includes(user.role)

    let convites: any[] | null = null
    let membrosRes: any[] = membrosRaw

    if (isGestor) {
      convites = await prisma.convite.findMany({
        where: { 
          empresaId: user.empresaId,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Segurança: Membros comuns não devem ver convites pendentes (privacidade/enumeração)
      membrosRes = membrosRaw.map(m => ({
        id: m.id,
        nome: m.nome,
        role: m.role,
        ativo: m.ativo,
        email: m.email,
        createdAt: m.createdAt
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
    // Hardening: Log detalhado interno, resposta genérica externa
    console.error('[API EQUIPE ERROR]', error)
    return NextResponse.json(
      { error: sanitizeErrorMessage(error, { strict: true }) }, 
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
