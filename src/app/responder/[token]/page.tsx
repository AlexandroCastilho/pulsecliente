import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PublicSurveyForm from '@/components/PublicSurveyForm'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function PublicSurveyPage({ params }: PageProps) {
  const { token } = await params

  // 1. Buscar o envio pelo token
  const envio = await prisma.envio.findUnique({
    where: { token },
    include: {
      pesquisa: {
        include: {
          perguntas: {
            orderBy: { ordem: 'asc' }
          },
          empresa: {
            select: { nome: true }
          }
        }
      }
    }
  })

  // 2. Validações básicas
  if (!envio) {
    notFound()
  }

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="max-w-xl w-full">
        {/* Header da Empresa */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Continuidade de Experiência</h2>
          <h1 className="text-gray-400 font-medium italic">Pesquisa de Satisfação - {envio.pesquisa.empresa.nome}</h1>
        </div>

        {/* Formulário Interativo (Client Component) */}
        <PublicSurveyForm envio={envio} pesquisa={envio.pesquisa} />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-xs font-medium flex items-center justify-center gap-2">
          <span>Powered by</span>
          <span className="font-bold text-indigo-600/50">PulseCliente</span>
        </div>
      </div>
    </div>
  )
}
