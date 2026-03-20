"use server"

import prisma from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import Stripe from "stripe"
import { ServiceResponse, successResponse, errorResponse } from "@/types/responses"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePriceGrowth = process.env.STRIPE_PRICE_GROWTH_ID
const stripePricePremium = process.env.STRIPE_PRICE_PREMIUM_ID

const PLAN_TO_PRICE: Record<"GROWTH" | "PREMIUM", string | undefined> = {
  GROWTH: stripePriceGrowth,
  PREMIUM: stripePricePremium,
}

export async function getSettingsData() {
  try {
    const user = await getAuthenticatedUser()

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
    include: { 
      empresa: {
        include: {
          smtpConfig: true
        }
      }
    }
  })

  if (!dbUser) return null

    return {
      user: {
        nome: dbUser.nome,
        email: dbUser.email
      },
      empresa: {
        nome: dbUser.empresa.nome,
        id: dbUser.empresaId,
        plano: dbUser.empresa.plano as any,
        assinaturaAtiva: dbUser.empresa.assinaturaAtiva,
      },
      smtp: dbUser.empresa.smtpConfig
    }
  } catch (error) {
    console.error("[GET_SETTINGS_ERROR]", error)
    return null
  }
}

export async function saveSettings(formData: FormData) {
  try {
    const dbUser = await getAuthenticatedUser(['OWNER', 'ADMIN'])

  // 1. Dados do Usuário
  const userName = formData.get("userName") as string
  if (userName) {
    await prisma.usuario.update({
      where: { id: dbUser.id },
      data: { nome: userName }
    })
  }

  // 2. Dados da Empresa
  const companyName = formData.get("companyName") as string
  if (companyName) {
    await prisma.empresa.update({
      where: { id: dbUser.empresaId },
      data: { nome: companyName }
    })
  }

  // 3. Dados SMTP
  const host = formData.get("host") as string
  const portStr = formData.get("port") as string
  const userSmtp = formData.get("user") as string
  const pass = formData.get("pass") as string
  const fromName = formData.get("fromName") as string
  const fromEmail = formData.get("fromEmail") as string

  // Só tenta salvar SMTP se pelo menos o host for preenchido
  if (host) {
    const port = parseInt(portStr) || 587
    await prisma.smtpConfig.upsert({
      where: { empresaId: dbUser.empresaId },
      update: {
        host,
        port,
        user: userSmtp,
        pass,
        fromName,
        fromEmail
      },
      create: {
        host,
        port,
        user: userSmtp,
        pass,
        fromName,
        fromEmail,
        empresaId: dbUser.empresaId
      }
    })
  }

    revalidatePath("/configuracoes")
    revalidatePath("/(painel)", "layout") // Revalida o layout para atualizar o Header/Sidebar
    return successResponse(true)
  } catch (error: any) {
    console.error("[SAVE_SETTINGS_ERROR]", error)
    return errorResponse(error.message || "Erro ao salvar configurações", "INTERNAL_ERROR")
  }
}

export async function criarCheckoutAssinatura(plan: "GROWTH" | "PREMIUM") {
  try {
    const user = await getAuthenticatedUser(['OWNER'])

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY não configurada")
  }

  const priceId = PLAN_TO_PRICE[plan]

  if (!priceId) {
    throw new Error(`Price ID do plano ${plan} não configurado`)
  }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        nome: true,
        empresaId: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            stripeCustomerId: true,
          }
        }
      }
    })

    if (!dbUser) {
      throw new Error("Usuário não encontrado")
    }

  const stripe = new Stripe(stripeSecretKey)
  let stripeCustomerId = dbUser.empresa.stripeCustomerId

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.empresa.nome || dbUser.nome,
      metadata: {
        empresaId: dbUser.empresaId,
        usuarioId: dbUser.id,
      },
    })

    stripeCustomerId = customer.id

    await prisma.empresa.update({
      where: { id: dbUser.empresaId },
      data: { stripeCustomerId },
    })
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/configuracoes?billing=success`,
    cancel_url: `${appUrl}/configuracoes?billing=cancel`,
    metadata: {
      empresaId: dbUser.empresaId,
      priceId,
      plan,
    },
    allow_promotion_codes: true,
  })

  if (!session.url) {
    return errorResponse("Não foi possível criar sessão de checkout", "INTERNAL_ERROR")
  }

  return successResponse({ url: session.url })
  } catch (error: any) {
    console.error("[ERRO SETTINGS]", error)
    return errorResponse(error.message || "Erro ao iniciar checkout", "INTERNAL_ERROR")
  }
}
