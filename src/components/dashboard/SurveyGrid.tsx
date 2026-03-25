import prisma from '@/lib/prisma'
import { SurveyCard } from './SurveyCard'

export async function SurveyGrid({ empresaId }: { empresaId: string }) {
  const pesquisas = await prisma.pesquisa.findMany({
    where: { empresaId },
    include: {
      _count: {
        select: {
          envios: {
            where: { status: 'RESPONDIDO' }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (pesquisas.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pesquisas.map((p) => (
        <SurveyCard key={p.id} pesquisa={p} />
      ))}
    </div>
  )
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-gray-100 h-64 p-8">
           <div className="flex justify-between mb-6">
              <div className="w-16 h-6 bg-gray-100 rounded-lg"></div>
              <div className="w-10 h-10 bg-gray-50 rounded-xl"></div>
           </div>
           <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
           <div className="h-4 bg-gray-50 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}
