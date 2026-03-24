import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { getTransporter, getMailConfig } from "@/lib/mail"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 1. Validar Autorização (Cron Secret OU Sessão do Usuário)
    let isAuthorizedByCron = false;
    let authEmpresaId = null;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorizedByCron = true;
    } else {
      // Tenta validar pela sessão do Supabase (para disparos via interface UI)
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Não autorizado - Acesso negado. Sessão inexistente ou token inválido.' }, { status: 401 });
      }
      
      const dbUser = await prisma.usuario.findUnique({
        where: { id: user.id },
        select: { empresaId: true }
      })

      if (!dbUser) {
        return NextResponse.json({ error: 'Não autorizado - Usuário sem empresa associada' }, { status: 401 });
      }
      
      authEmpresaId = dbUser.empresaId;
    }

    const body = await req.json().catch(() => ({}));
    const { pesquisaId } = body;

    if (!pesquisaId) {
      return NextResponse.json({ error: 'pesquisaId é obrigatório' }, { status: 400 })
    }

    // 2. Buscar a pesquisa para pegar o título e empresaId
    const pesquisa = await prisma.pesquisa.findUnique({
      where: { id: pesquisaId },
      select: { titulo: true, empresaId: true }
    })

    if (!pesquisa) {
      return NextResponse.json({ error: 'Pesquisa não encontrada' }, { status: 404 })
    }

    // Validação final de IDOR para disparo manual:
    const isOwner = authEmpresaId !== null && pesquisa.empresaId === authEmpresaId;
    
    if (!isAuthorizedByCron && !isOwner) {
       return NextResponse.json({ error: 'Acesso Restrito: Esta pesquisa não pertence à sua empresa.' }, { status: 403 })
    }

    // 2. Buscar Configuração SMTP
    const smtpConfig = await getMailConfig(pesquisa.empresaId)
    if (!smtpConfig || !smtpConfig.host) {
      await prisma.envio.updateMany({
        where: { pesquisaId, status: 'PROCESSANDO' },
        data: { status: 'ERRO', erroLog: 'Configuração SMTP não configurada.' }
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

    // 4. Configurar Transporter via Factory
    const transporter = await getTransporter(pesquisa.empresaId)

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

    // 5. Processamento com Chunking e Paralelismo Controlado
    const CHUNK_SIZE = 50
    const chunks = []
    for (let i = 0; i < enviosParaProcessar.length; i += CHUNK_SIZE) {
      chunks.push(enviosParaProcessar.slice(i, i + CHUNK_SIZE))
    }

    for (const [index, chunk] of chunks.entries()) {
      console.log(`[SMTP] Processando bloco ${index + 1}/${chunks.length} (${chunk.length} envios)`)
      
      await Promise.allSettled(chunk.map(async (envio) => {
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
                  <a href="${linkPesquisa}" style="color: #9ca3af;">${linkPesquisa}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
                <p style="font-size: 11px; color: #d1d5db; text-align: center;">
                  Não deseja mais receber as nossas pesquisas?
                  <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(envio.emailDestinatario)}" style="color: #d1d5db; text-decoration: underline;">
                    Clique aqui para cancelar a subscrição
                  </a>.
                </p>
              </div>
            `
          })

          await prisma.envio.update({
            where: { id: envio.id },
            data: { status: 'ENVIADO', enviadoEm: new Date(), erroLog: null }
          })
        } catch (err: any) {
          console.error(`[ERRO SMTP] ${envio.emailDestinatario}:`, err.message)
          await prisma.envio.update({
            where: { id: envio.id },
            data: { 
              status: 'ERRO', 
              erroLog: (err.response || err.message || 'Erro no envio').toString() 
            }
          })
        }
      }))

      // Pequeno delay entre blocos para evitar ser bloqueado pelo provedor SMTP
      if (index < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({ success: true, processed: enviosParaProcessar.length })

  } catch (error: any) {
    console.error('[ERRO WORKER DISPARO]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
