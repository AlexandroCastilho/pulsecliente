"use server"

import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function processarDisparo(pesquisaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' }
    }

    // 1. Validar usuário e empresa
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true, nome: true }
    })

    if (!dbUser) {
      return { success: false, message: 'Perfil de usuário não encontrado.' }
    }

    // 2. Validar pesquisa
    const pesquisa = await prisma.pesquisa.findFirst({
      where: { id: pesquisaId, empresaId: dbUser.empresaId }
    })

    if (!pesquisa) {
      return { success: false, message: 'Pesquisa não encontrada ou acesso negado.' }
    }

    // 3. Buscar envios pendentes
    const pendentes = await prisma.envio.findMany({
      where: { pesquisaId, status: 'PENDENTE' }
    })

    if (pendentes.length === 0) {
      return { success: false, message: 'Não há disparos pendentes para esta pesquisa.' }
    }

    // 4. Buscar Configuração SMTP da Empresa
    const smtpConfig = await prisma.smtpConfig.findUnique({
      where: { empresaId: dbUser.empresaId }
    })

    if (!smtpConfig) {
      return { success: false, message: 'Configuração SMTP não encontrada. Configure o disparo nas definições.' }
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    let sucessos = 0
    let falhas = 0

    // 5. Loop de Disparo Real
    for (const envio of pendentes) {
      try {
        const linkPesquisa = `${appUrl}/responder/${envio.token}`
        
        const info = await transporter.sendMail({
          from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
          to: envio.emailDestinatario,
          subject: `Pesquisa: ${pesquisa.titulo}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
              <h2 style="color: #4f46e5;">Olá, ${envio.nomeDestinatario || 'Cliente'}!</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                A empresa <strong>${dbUser.nome}</strong> gostaria de ouvir a sua opinião sobre: <br/>
                <span style="font-size: 18px; font-weight: bold; color: #111827;">${pesquisa.titulo}</span>
              </p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${linkPesquisa}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Responder Pesquisa
                </a>
              </div>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 40px; text-align: center;">
                Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:<br/>
                <a href="${linkPesquisa}">${linkPesquisa}</a>
              </p>
            </div>
          `
        })

        console.log(`[E-MAIL ENVIADO] Para: ${envio.emailDestinatario}`)

        // Atualizar no Prisma
        await prisma.envio.update({
          where: { id: envio.id },
          data: { status: 'ENVIADO', enviadoEm: new Date() }
        })
        sucessos++
      } catch (err: any) {
        console.error(`[ERRO ENVIO E-MAIL] ${envio.emailDestinatario}:`, err.message)
        await prisma.envio.update({
          where: { id: envio.id },
          data: { status: 'ERRO', erroLog: err.message }
        })
        falhas++
      }
    }

    return { 
      success: true, 
      count: sucessos,
      falhas,
      message: `${sucessos} e-mails enviados. ${falhas} falhas.` 
    }

  } catch (error: any) {
    console.error('[ERRO PROCESSAR DISPARO]', error)
    return { 
      success: false, 
      message: 'Erro interno ao processar disparos.',
      details: error.message 
    }
  }
}
