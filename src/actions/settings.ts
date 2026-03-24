"use server"

import prisma from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import Stripe from "stripe"
import { ServiceResponse, successResponse, errorResponse } from "@/types/responses"
import { encrypt } from "@/lib/crypto"

import { z } from "zod"

const SettingsSchema = z.object({
  userName: z.string().min(2, "Nome curto demais").optional(),
  companyName: z.string().min(2, "Nome da empresa curto demais").optional(),
  companyLogo: z.string().optional(),
  emailBrandColor: z.string().optional(),
  emailLogoUrl: z.string().url("Logo do e-mail deve ser uma URL válida").optional().or(z.literal("")),
  emailHeaderText: z.string().optional(),
  host: z.string().optional(),
  port: z.string().optional(),
  user: z.string().optional(),
  pass: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email("E-mail do remetente inválido").optional().or(z.literal("")),
})

import { PLAN_TO_PRICE } from '@/lib/constants'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function getSettingsData() {
  try {
    const user = await getAuthenticatedUser()

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { nome: true, email: true, empresaId: true }
    })

    if (!dbUser) return null

    const empresa = await prisma.empresa.findUnique({
      where: { id: dbUser.empresaId },
      include: { smtpConfig: true }
    })

    if (!empresa) return null

    return {
      user: {
        nome: dbUser.nome,
        email: dbUser.email
      },
      empresa: {
        nome: empresa.nome,
        logo: (empresa as any).logo,
        id: empresa.id,
        plano: empresa.plano as string,
        assinaturaAtiva: empresa.assinaturaAtiva,
        emailBrandColor: (empresa as any).emailBrandColor,
        emailLogoUrl: (empresa as any).emailLogoUrl,
        emailHeaderText: (empresa as any).emailHeaderText,
      },
      smtp: empresa.smtpConfig ? { ...empresa.smtpConfig, pass: '' } : null
    }
  } catch (error) {
    console.error("[GET_SETTINGS_ERROR]", error)
    return null
  }
}

export async function saveSettings(formData: FormData) {
  try {
    const dbUser = await getAuthenticatedUser(['OWNER', 'ADMIN'])

    // 0. Validação Zod
    const rawData = Object.fromEntries(formData.entries())
    const validated = SettingsSchema.safeParse(rawData)
    
    if (!validated.success) {
      return errorResponse(validated.error.issues[0].message, "VALIDATION_ERROR")
    }

    const data = validated.data

  // 1. Dados do Usuário
  if (data.userName) {
    await prisma.usuario.update({
      where: { id: dbUser.id },
      data: { nome: data.userName }
    })
  }

  // 2. Dados da Empresa
  // Verifica o plano do usuário antes de salvar dados de personalização premium
  const empresa = await prisma.empresa.findUnique({
    where: { id: dbUser.empresaId },
    select: { plano: true }
  })

  if (!empresa) {
    throw new Error("Empresa não encontrada")
  }

  const isPremium = empresa.plano !== 'FREE'

  const companyUpdateData: {
    nome?: string;
    logo?: string;
    emailBrandColor?: string;
    emailLogoUrl?: string;
    emailHeaderText?: string;
  } = {}

  if (data.companyName) {
    companyUpdateData.nome = data.companyName
  }

  if (data.companyLogo) {
    companyUpdateData.logo = data.companyLogo
  }

  // Só salva dados de personalização de e-mail se o plano for premium
  if (isPremium) {
    if (data.emailBrandColor) {
      companyUpdateData.emailBrandColor = data.emailBrandColor
    }
    if (data.emailLogoUrl) {
      companyUpdateData.emailLogoUrl = data.emailLogoUrl
    }
    if (data.emailHeaderText) {
      companyUpdateData.emailHeaderText = data.emailHeaderText
    }
  }

  if (Object.keys(companyUpdateData).length > 0) {
    await prisma.empresa.update({
      where: { id: dbUser.empresaId },
      data: companyUpdateData
    })
  }

  // 3. Dados SMTP
  // Só tenta salvar SMTP se pelo menos o host for preenchido
  if (data.host) {
    const port = parseInt(data.port || "587")
    const encryptedPass = data.pass ? encrypt(data.pass) : undefined

    await prisma.smtpConfig.upsert({
      where: { empresaId: dbUser.empresaId },
      update: {
        host: data.host,
        port,
        user: data.user,
        ...(encryptedPass ? { pass: encryptedPass } : {}),
        fromName: data.fromName,
        fromEmail: data.fromEmail
      },
      create: {
        host: data.host,
        port,
        user: data.user || "",
        pass: encryptedPass || "",
        fromName: data.fromName || "",
        fromEmail: data.fromEmail || "",
        empresaId: dbUser.empresaId
      }
    })
  }

    revalidatePath("/configuracoes")
    revalidatePath("/(painel)", "layout") // Revalida o layout para atualizar o Header/Sidebar
    return successResponse(true)
  } catch (error) {
    console.error("[SAVE_SETTINGS_ERROR]", error)
    const message = error instanceof Error ? error.message : "Erro ao salvar configurações"
    return errorResponse(message, "INTERNAL_ERROR")
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
  } catch (error) {
    console.error("[ERRO SETTINGS]", error)
    const message = error instanceof Error ? error.message : "Erro ao iniciar checkout"
    return errorResponse(message, "INTERNAL_ERROR")
  }
}
