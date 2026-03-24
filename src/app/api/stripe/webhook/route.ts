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

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const empresaId = subscription.metadata.empresaId

          if (empresaId) {
            const priceId = (invoice.lines.data[0] as any)?.price?.id
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

            console.log(`[STRIPE WEBHOOK] Plano atualizado para ${plano} para a empresa ${empresaId}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.empresa.update({
          where: { stripeCustomerId: customerId },
          data: {
            plano: 'FREE',
            assinaturaAtiva: false,
            stripeSubscriptionId: null,
            stripePriceId: null
          }
        })

        console.log(`[STRIPE WEBHOOK] Assinatura cancelada para o cliente ${customerId}`)
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[STRIPE WEBHOOK ERROR]', error)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }
}
