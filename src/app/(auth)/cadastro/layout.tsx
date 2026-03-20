import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crie sua Conta | Opinaloop',
  description: 'Comece a entender seus clientes hoje mesmo. Crie sua conta gratuita no Opinaloop.',
}

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
