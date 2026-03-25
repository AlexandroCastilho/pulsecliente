import nodemailer from 'nodemailer'
import prisma from './prisma'
import { decrypt } from './crypto'

export async function getTransporter(empresaId: string) {
  const smtpConfig = await prisma.smtpConfig.findUnique({
    where: { empresaId }
  })

  if (!smtpConfig || !smtpConfig.host) {
    // Fallback para SMTP padrão se não houver config personalizada
    // (Pode ser configurado via variáveis de ambiente)
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    }
    throw new Error('Configuração SMTP não encontrada para a empresa.')
  }

  // Descriptografar a senha se existir
  let password = smtpConfig.pass
  try {
    if (password && password.includes(':')) {
      password = decrypt(password)
    }
  } catch (err) {
    console.error('[MAIL_FACTORY] Erro ao descriptografar senha SMTP:', err)
  }

  return nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: {
      user: smtpConfig.user || '',
      pass: password || '',
    },
  })
}

export async function getMailConfig(empresaId: string) {
  return await prisma.smtpConfig.findUnique({
    where: { empresaId }
  })
}
