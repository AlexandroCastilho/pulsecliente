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

    const body = await request.json().catch(() => ({}))
    const { priceId, empresaId } = body as { priceId?: string; empresaId?: string }

    if (!priceId || !empresaId) {
      return NextResponse.json({ error: 'priceId e empresaId são obrigatórios' }, { status: 400 })
    }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true, email: true, nome: true }
    })

    if (!dbUser || dbUser.empresaId !== empresaId) {
      return NextResponse.json({ error: 'Acesso negado para esta empresa' }, { status: 403 })
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true, nome: true, stripeCustomerId: true }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const stripe = new Stripe(stripeSecretKey)

    let stripeCustomerId = empresa.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: empresa.nome || dbUser.nome,
        metadata: {
          empresaId: empresa.id,
          usuarioId: user.id,
        },
      })

      stripeCustomerId = customer.id

      await prisma.empresa.update({
        where: { id: empresa.id },
        data: { stripeCustomerId },
      })
    }

    const baseUrl = getAppBaseUrl(request)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/configuracoes?billing=success`,
      cancel_url: `${baseUrl}/configuracoes?billing=cancel`,
      metadata: {
        empresaId: empresa.id,
        priceId,
      },
      allow_promotion_codes: true,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Não foi possível criar a sessão de checkout' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[STRIPE CHECKOUT ERROR]', error)
    return NextResponse.json({ error: 'Erro interno ao criar checkout' }, { status: 500 })
  }
}
