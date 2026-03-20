"use server"

import prisma from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { sanitizeErrorMessage } from "@/lib/error-handler"
import { ServiceResponse, successResponse, errorResponse } from "@/types/responses"

import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function convidarMembro(formData: FormData) {
  try {
    const dbUser = await getAuthenticatedUser(['OWNER', 'ADMIN'])

    // Buscar o nome da empresa separadamente para o e-mail
    const empresa = await prisma.empresa.findUnique({
      where: { id: dbUser.empresaId },
      select: { nome: true }
    })
    
    if (!empresa) throw new Error("Empresa não encontrada.")

    const nome = formData.get("nome") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as Role

    // 1. Verificar se já existe na empresa (como usuário ou convite pendente)
    const existingUser = await prisma.usuario.findUnique({ where: { email } })
    if (existingUser) throw new Error("Este e-mail já pertence a um membro ativo.")

    const existingInvite = await prisma.convite.findUnique({ where: { email } })
    if (existingInvite && existingInvite.status === 'PENDING') {
      // Opcional: Reenviar o convite ou apenas avisar
      throw new Error("Já existe um convite pendente para este e-mail.")
    }

    // 2. Buscar Configuração SMTP da Empresa
    const smtpConfig = await prisma.smtpConfig.findUnique({
      where: { empresaId: dbUser.empresaId }
    })

    if (!smtpConfig) {
      throw new Error("Configuração SMTP não encontrada. Configure o SMTP da sua empresa antes de enviar convites.")
    }

    // 3. Criar Convite
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

    await prisma.convite.upsert({
      where: { email },
      update: {
        token,
        nome,
        role,
        status: 'PENDING',
        expiresAt
      },
      create: {
        email,
        nome,
        role,
        token,
        empresaId: dbUser.empresaId,
        expiresAt
      }
    })

    // 4. Enviar E-mail
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const linkConvite = `${appUrl}/aceitar-convite?token=${token}`

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: email,
      subject: `Convite para a Equipa: ${empresa.nome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #4f46e5;">Olá, ${nome}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Você foi convidado por <strong>${dbUser.nome}</strong> para se juntar à equipa da <strong>${empresa.nome}</strong> no Opinaloop.
          </p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${linkConvite}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Aceitar Convite
            </a>
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 40px; text-align: center;">
            Este convite expira em 7 dias. Se o botão acima não funcionar, copie e cole o link abaixo:<br/>
            <a href="${linkConvite}">${linkConvite}</a>
          </p>
        </div>
      `
    })

    revalidatePath("/equipe")
    return successResponse(true)
  } catch (error) {
    console.error('[CONVITE ERROR]', error)
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}

export async function updateMembroRole(membroId: string, newRole: Role) {
  try {
    const dbUser = await getAuthenticatedUser(['OWNER'])

    await prisma.usuario.update({
      where: { 
        id: membroId,
        empresaId: dbUser.empresaId 
      },
      data: { role: newRole }
    })

    revalidatePath("/equipe")
    return successResponse(true)
  } catch (error) {
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}
export async function removerConvite(id: string) {
  try {
    const dbUser = await getAuthenticatedUser(['OWNER', 'ADMIN'])

    revalidatePath("/equipe")
    return successResponse(true)
  } catch (error) {
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}

export async function toggleMembroStatus(membroId: string, currentStatus: boolean) {
  try {
    const dbUser = await getAuthenticatedUser(['OWNER', 'ADMIN'])

    await prisma.usuario.update({
      where: { 
        id: membroId,
        empresaId: dbUser.empresaId
      },
      data: { ativo: !currentStatus }
    })

    revalidatePath("/equipe")
    return successResponse(true)
  } catch (error) {
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}

export async function removerMembro(membroId: string) {
  try {
    const dbUser = await getAuthenticatedUser(['OWNER'])

    if (dbUser.id === membroId) {
      throw new Error("Você não pode remover a si mesmo.")
    }

    const result = await prisma.usuario.deleteMany({
      where: { 
        id: membroId,
        empresaId: dbUser.empresaId
      }
    })

    if (result.count === 0) {
      throw new Error("Membro não encontrado ou não pertence a esta empresa.")
    }

    revalidatePath("/equipe")
    return successResponse(true)
  } catch (error) {
    return errorResponse(sanitizeErrorMessage(error), 'INTERNAL_ERROR')
  }
}
