import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
  }

  try {
    // Marca o envio mais recente deste e-mail como EXPIRADO para evitar novos disparos nesta pesquisa
    // Em um cenário real, teríamos uma tabela de Blacklist/Unsubscribed.
    await prisma.envio.updateMany({
      where: { 
        emailDestinatario: email,
        status: { in: ['PENDENTE', 'PROCESSANDO'] }
      },
      data: { 
        status: 'EXPIRADO',
        erroLog: 'Usuário solicitou descadastro (Unsubscribe).'
      }
    })

    // Retorna uma página HTML simples de confirmação
    return new NextResponse(`
      <html>
        <head>
          <title>Descadastro Realizado</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f9fafb; }
            .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; border: 1px solid #e5e7eb; }
            h1 { color: #4f46e5; margin-bottom: 1rem; }
            p { color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Descadastro Confirmado</h1>
            <p>Seu e-mail <strong>${email}</strong> foi removido da lista de disparos desta pesquisa.</p>
            <p>Obrigado pelo seu tempo.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar descadastro' }, { status: 500 })
  }
}

// Suporte para POST (List-Unsubscribe-Post)
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({}, { status: 400 })

  try {
    await prisma.envio.updateMany({
      where: { 
        emailDestinatario: email,
        status: { in: ['PENDENTE', 'PROCESSANDO'] }
      },
      data: { 
        status: 'EXPIRADO',
        erroLog: 'Unsubscribe via One-Click header.'
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({}, { status: 500 })
  }
}
