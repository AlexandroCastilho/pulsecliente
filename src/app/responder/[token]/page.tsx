import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PublicSurveyForm from '@/components/PublicSurveyForm'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params

  try {
    const envio = await prisma.envio.findUnique({
      where: { token },
      select: {
        pesquisa: {
          select: { titulo: true }
        }
      }
    })

    if (!envio?.pesquisa) {
      return {
        title: "Pesquisa Indisponível | Opinaloop",
        description: "Esta pesquisa não foi encontrada ou não está ativa."
      }
    }

    const titulo = `${envio.pesquisa.titulo} | Opinaloop`
    const decricao = "A sua opinião é muito importante! Clique aqui para responder a esta pesquisa rápida."

    return {
      title: titulo,
      description: decricao,
      openGraph: {
        title: titulo,
        description: decricao,
        images: ["/og-image.png"],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: titulo,
        description: decricao,
        images: ["/og-image.png"],
      }
    }
  } catch (error) {
    return {
      title: "Opinaloop",
      description: "Plataforma de Pesquisas de Satisfação"
    }
  }
}

export default async function PublicSurveyPage({ params }: PageProps) {
  const { token } = await params

  // 1. Buscar o envio pelo token
  const envio = await prisma.envio.findUnique({
    where: { token },
    select: {
      id: true,
      emailDestinatario: true,
      nomeDestinatario: true,
      status: true,
      token: true,
      pesquisaId: true,
      pesquisa: {
        select: {
          id: true,
          titulo: true,
          descricao: true,
          ativa: true,
          dataInicio: true,
          dataFim: true,
          createdAt: true,
          empresa: { select: { nome: true } },
          perguntas: { orderBy: { ordem: 'asc' } }
        }
      }
    }
  })

  if (!envio) notFound()

  // 2. Validações básicas
  if (envio.status === 'RESPONDIDO') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pesquisa Concluída!</h1>
          <p className="text-gray-500 font-medium">Você já respondeu a esta pesquisa. Agradecemos imensamente sua participação e feedback.</p>
          <div className="pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Enviado por {envio.pesquisa.empresa.nome}</p>
          </div>
        </div>
      </div>
    )
  }

  const now = new Date()
  const dataInicio = envio.pesquisa.dataInicio ? new Date(envio.pesquisa.dataInicio) : null
  const dataFim = envio.pesquisa.dataFim ? new Date(envio.pesquisa.dataFim) : null

  if (dataInicio && now < dataInicio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 space-y-6">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ainda não começou!</h1>
          <p className="text-gray-500 font-medium">Esta pesquisa estará disponível a partir de {dataInicio.toLocaleDateString('pt-BR')}.</p>
        </div>
      </div>
    )
  }

  if (dataFim && now > dataFim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pesquisa Finalizada</h1>
          <p className="text-gray-500 font-medium">O prazo para responder a esta pesquisa expirou em {dataFim.toLocaleDateString('pt-BR')}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="max-w-xl w-full">
        {/* Header da Empresa */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Continuidade de Experiência</h2>
          <h1 className="text-gray-400 font-medium italic">Pesquisa de Satisfação - {envio.pesquisa.empresa.nome}</h1>
        </div>

        {/* Formulário Interativo (Client Component) */}
        <PublicSurveyForm envio={envio as any} pesquisa={envio.pesquisa as any} />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-xs font-medium flex items-center justify-center gap-2">
          <span>Powered by</span>
          <span className="font-bold text-indigo-600/50">Opinaloop</span>
        </div>
      </div>
    </div>
  )
}
