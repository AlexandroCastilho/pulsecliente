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
      // Timeout curto para teste
      connectionTimeout: 10000,
      greetingTimeout: 5000,
    })

    // Verificar conexão primeiro
    await transporter.verify()

    // Enviar e-mail de teste
    await transporter.sendMail({
      from: `"${data.fromName}" <${data.fromEmail}>`,
      to: user.email!,
      subject: "📧 Teste de Configuração SMTP - OpinaLoop",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #4f46e5;">Sucesso!</h2>
          <p>Se você está recebendo este e-mail, significa que sua configuração SMTP no <strong>OpinaLoop</strong> está funcionando corretamente.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático de teste enviado por sua solicitação.</p>
        </div>
      `,
    })

    return successResponse(true)
  } catch (error: any) {
    console.error("[SMTP_TEST_ERROR]", error)
    
    // Tentar extrair uma mensagem amigável
    let message = "Falha na conexão com o servidor SMTP."
    
    if (error.code === 'EAUTH') {
      message = "Erro de autenticação: Usuário ou senha incorretos. Verifique se você está usando uma 'Senha de Aplicativo' se for Gmail/Outlook."
    } else if (error.code === 'ECONNREFUSED') {
      message = "Conexão recusada: O host ou a porta estão incorretos."
    } else if (error.code === 'ETIMEDOUT') {
      message = "Tempo de conexão esgotado: O servidor demorou muito para responder."
    } else if (error.message) {
      message = error.message
    }

    return errorResponse(message, "INTERNAL_ERROR")
  }
}
