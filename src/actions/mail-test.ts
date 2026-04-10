"use server"

import nodemailer from 'nodemailer'
import { getAuthenticatedUser } from "@/lib/auth-guard"
import { ServiceResponse, successResponse, errorResponse } from "@/types/responses"

interface TestSmtpData {
  host: string
  port: number
  user: string
  pass: string
  fromName: string
  fromEmail: string
}

type TransportError = Error & {
  code?: string
}

export async function sendTestEmail(data: TestSmtpData): Promise<ServiceResponse<boolean>> {
  try {
    const user = await getAuthenticatedUser()

    const transporter = nodemailer.createTransport({
      host: data.host,
      port: data.port,
      secure: data.port === 465,
      auth: {
        user: data.user,
        pass: data.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
    })

    await transporter.verify()

    await transporter.sendMail({
      from: `"${data.fromName}" <${data.fromEmail}>`,
      to: user.email,
      subject: "Teste de Configuracao SMTP - OpinaLoop",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #4f46e5;">Sucesso!</h2>
          <p>Se voce esta recebendo este e-mail, significa que sua configuracao SMTP no <strong>OpinaLoop</strong> esta funcionando corretamente.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">Este e um e-mail automatico de teste enviado por sua solicitacao.</p>
        </div>
      `,
    })

    return successResponse(true)
  } catch (error: unknown) {
    console.error("[SMTP_TEST_ERROR]", error)

    let message = "Falha na conexao com o servidor SMTP."
    const transportError = error instanceof Error ? (error as TransportError) : null

    if (transportError?.code === 'EAUTH') {
      message = "Erro de autenticacao: Usuario ou senha incorretos. Verifique se voce esta usando uma Senha de Aplicativo se for Gmail/Outlook."
    } else if (transportError?.code === 'ECONNREFUSED') {
      message = "Conexao recusada: O host ou a porta estao incorretos."
    } else if (transportError?.code === 'ETIMEDOUT') {
      message = "Tempo de conexao esgotado: O servidor demorou muito para responder."
    } else if (transportError?.message) {
      message = transportError.message
    }

    return errorResponse(message, "INTERNAL_ERROR")
  }
}
