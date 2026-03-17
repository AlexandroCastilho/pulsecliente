import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { pesquisaId } = await req.json()

    if (!pesquisaId) {
      return NextResponse.json({ error: 'pesquisaId é obrigatório' }, { status: 400 })
    }

    // 1. Buscar a pesquisa para pegar o título e empresaId
    const pesquisa = await prisma.pesquisa.findUnique({
      where: { id: pesquisaId },
      select: { titulo: true, empresaId: true }
    })

    if (!pesquisa) {
      return NextResponse.json({ error: 'Pesquisa não encontrada' }, { status: 404 })
    }

    // 2. Buscar Configuração SMTP da Empresa
    const smtpConfig = await prisma.smtpConfig.findUnique({
      where: { empresaId: pesquisa.empresaId }
    })

    if (!smtpConfig) {
      // Marcar os PROCESSANDO como ERRO se não houver SMTP
      await prisma.envio.updateMany({
        where: { pesquisaId, status: 'PROCESSANDO' },
        data: { status: 'ERRO', erroLog: 'Configuração SMTP não encontrada para esta empresa.' }
      })
      return NextResponse.json({ error: 'SMTP não configurado' }, { status: 400 })
    }

    // 3. Buscar envios que foram marcados como PROCESSANDO
    const enviosParaProcessar = await prisma.envio.findMany({
      where: { pesquisaId, status: 'PROCESSANDO' }
    })

    if (enviosParaProcessar.length === 0) {
      return NextResponse.json({ message: 'Nenhum envio em processamento' })
    }

    // 4. Configurar Transporter
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

    // 5. Processamento Assíncrono Real (Loop)
    // Nota: Como este endpoint é chamado via Fire-and-Forget, 
    // rodamos o loop sem travar a resposta inicial do worker se necessário,
    // mas aqui o worker JÁ É a execução em si.
    
    for (const envio of enviosParaProcessar) {
      try {
        const linkPesquisa = `${appUrl}/responder/${envio.token}`
        
        await transporter.sendMail({
          from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
          to: envio.emailDestinatario,
          subject: `Pesquisa: ${pesquisa.titulo}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #4f46e5;">Olá, ${envio.nomeDestinatario || 'Cliente'}!</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Gostaríamos de ouvir a sua opinião sobre: <br/>
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

        // Sucesso
        await prisma.envio.update({
          where: { id: envio.id },
          data: { status: 'ENVIADO', enviadoEm: new Date(), erroLog: null }
        })

      } catch (err: any) {
        // Erro Detalhado do SMTP
        console.error(`[ERRO SMTP] ${envio.emailDestinatario}:`, err)
        
        const errorMessage = err.response || err.message || 'Erro desconhecido no servidor de e-mail'
        
        await prisma.envio.update({
          where: { id: envio.id },
          data: { 
            status: 'ERRO', 
            erroLog: errorMessage.toString() 
          }
        })
      }
    }

    return NextResponse.json({ success: true, processed: enviosParaProcessar.length })

  } catch (error: any) {
    console.error('[ERRO WORKER DISPARO]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
