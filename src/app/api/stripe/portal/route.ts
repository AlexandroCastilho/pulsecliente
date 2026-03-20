import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

function getAppBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  try {
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY não configurada' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: dbUser.empresaId },
      select: { stripeCustomerId: true }
    })

    if (!empresa?.stripeCustomerId) {
      return NextResponse.json({ error: 'Nenhuma assinatura Stripe vinculada a esta empresa' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecretKey)
    const baseUrl = getAppBaseUrl(request)

    const session = await stripe.billingPortal.sessions.create({
      customer: empresa.stripeCustomerId,
      return_url: `${baseUrl}/configuracoes`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[STRIPE PORTAL ERROR]', error)
    return NextResponse.json({ error: 'Erro interno ao abrir portal Stripe' }, { status: 500 })
  }
}
