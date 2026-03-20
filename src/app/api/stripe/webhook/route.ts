import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
        console.log('[STRIPE WEBHOOK] invoice.payment_succeeded', invoice.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('[STRIPE WEBHOOK] customer.subscription.deleted', subscription.id)
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
