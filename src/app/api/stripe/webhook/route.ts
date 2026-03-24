import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    if (!stripeSecretKey || !stripeWebhookSecret) {
      return NextResponse.json({ error: 'Configuração Stripe incompleta' }, { status: 500 })
    }

    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Assinatura do webhook ausente' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecretKey)
    const payload = await request.text()

    const event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret)
    const eventId = event.id

    // Interfaces auxiliares para evitar o uso de 'any' em propriedades polimórficas do Stripe
    interface StripeInvoice extends Stripe.Invoice {
      subscription: string | null;
    }

    interface StripeSubscription extends Stripe.Subscription {
      metadata: { empresaId?: string };
    }

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as StripeInvoice
        const subscriptionId = invoice.subscription

        if (!subscriptionId) {
          console.error(`[STRIPE_WEBHOOK][${eventId}] Subscription ID ausente na fatura ${invoice.id}`)
          return NextResponse.json({ error: 'Subscription ID ausente' }, { status: 400 })
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as StripeSubscription
        const empresaId = subscription.metadata.empresaId

        if (!empresaId) {
          console.warn(`[STRIPE_WEBHOOK][${eventId}] Metadata empresaId ausente na assinatura ${subscriptionId}. O evento será ignorado.`)
          return NextResponse.json({ received: true, ignored: true, reason: 'empresaId_missing' })
        }

        const lineItem = invoice.lines.data[0] as { price?: { id: string } }
        const priceId = lineItem?.price?.id

        if (!priceId) {
          console.error(`[STRIPE_WEBHOOK][${eventId}] Price ID ausente nos itens da fatura ${invoice.id}`)
          return NextResponse.json({ error: 'Price ID ausente' }, { status: 400 })
        }

        let plano = 'FREE'
        if (priceId === process.env.STRIPE_PRICE_GROWTH_ID) {
          plano = 'GROWTH'
        } else if (priceId === process.env.STRIPE_PRICE_PREMIUM_ID) {
          plano = 'PREMIUM'
        }

        await prisma.empresa.update({
          where: { id: empresaId },
          data: {
            plano,
            assinaturaAtiva: true,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: invoice.customer as string,
            stripePriceId: priceId
          }
        })

        console.log(`[STRIPE_WEBHOOK][${eventId}] Plano atualizado para ${plano} para a empresa ${empresaId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        if (!customerId) {
          console.warn(`[STRIPE_WEBHOOK][${eventId}] Customer ID ausente no evento de deleção de assinatura ${subscription.id}`)
          return NextResponse.json({ received: true })
        }

        await prisma.empresa.update({
          where: { stripeCustomerId: customerId },
          data: {
            plano: 'FREE',
            assinaturaAtiva: false,
            stripeSubscriptionId: null,
            stripePriceId: null
          }
        })

        console.log(`[STRIPE_WEBHOOK][${eventId}] Assinatura cancelada para o cliente ${customerId}`)
        break
      }

      default:
        console.log(`[STRIPE_WEBHOOK][${eventId}] Evento não tratado: ${event.type}`)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_CRITICAL_ERROR]', error)
    const message = error instanceof Error ? error.message : 'Erro interno no processamento do webhook'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
