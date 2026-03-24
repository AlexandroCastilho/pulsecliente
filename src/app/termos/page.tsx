import Link from 'next/link'
import type { Metadata } from 'next'
import { Infinity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso - Opinaloop',
  description: 'Leia os Termos de Uso da plataforma Opinaloop.',
  robots: 'index, follow',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Infinity className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-slate-900">Opinaloop</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-slate-400 mb-12">Última atualização: março de 2026</p>

        <div className="prose prose-slate max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Introdução</h2>
            <p className="text-slate-600 leading-relaxed">
              Bem-vindo ao Opinaloop. Ao acessar ou utilizar a nossa plataforma, concorda em
              ficar vinculado pelos presentes Termos de Uso. Leia-os atentamente antes de
              utilizar os nossos serviços. Caso não concorde com alguma das disposições aqui
              previstas, deverá cessar imediatamente a utilização da plataforma.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              O Opinaloop é uma plataforma de gestão de pesquisas de satisfação e Net Promoter
              Score (NPS), destinada a empresas e profissionais que desejam coletar e analisar
              o feedback dos seus clientes de forma estruturada e eficiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Uso dos Serviços</h2>
            <p className="text-slate-600 leading-relaxed">
              O usuário compromete-se a usar a plataforma exclusivamente para fins lícitos
              e de acordo com estes Termos. É expressamente proibido: utilizar o serviço para
              envio de comunicações não solicitadas (spam), realizar engenharia reversa ou
              tentativas de intrusão, compartilhar credenciais de acesso com terceiros não
              autorizados, ou utilizar a plataforma para atividades que violem direitos de
              terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Uso de Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Os dados introduzidos na plataforma, incluindo listas de contatos e respostas
              às pesquisas, são armazenados de forma segura e utilizados exclusivamente para
              prestar os serviços contratados. O Opinaloop não vende, aluga ou compartilha os
              seus dados pessoais com terceiros para fins comerciais sem o seu consentimento
              explícito.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              Ao utilizar a plataforma, o usuário declara ter obtido as devidas autorizações
              dos destinatários cujos e-mails são carregados para envio de pesquisas, nos
              termos da legislação de proteção de dados aplicável (LGPD / GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Responsabilidade pelo Conteúdo</h2>
            <p className="text-slate-600 leading-relaxed">
              O usuário é o único responsável pelo conteúdo das pesquisas criadas e pelos
              dados dos destinatários carregados na plataforma. O Opinaloop não se
              responsabiliza por quaisquer danos resultantes de conteúdos inadequados ou
              ilegais publicados pelos usuários.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Limitação de Responsabilidade</h2>
            <p className="text-slate-600 leading-relaxed">
              Na máxima extensão permitida pela lei aplicável, o Opinaloop não será responsável
              por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos,
              incluindo perda de lucros, dados, utilização ou goodwill, decorrentes do uso ou
              da impossibilidade de uso dos nossos serviços.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              A responsabilidade total do Opinaloop perante o usuário, por quaisquer
              reclamações decorrentes destes Termos, não excederá o valor pago pelo usuário
              à plataforma nos três meses anteriores ao fato gerador da reclamação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Alterações aos Termos</h2>
            <p className="text-slate-600 leading-relaxed">
              O Opinaloop reserva-se o direito de modificar estes Termos a qualquer momento.
              As alterações entram em vigor imediatamente após a sua publicação na plataforma.
              O uso continuado dos serviços após a publicação das alterações constitui a
              aceitação dos novos Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Contato</h2>
            <p className="text-slate-600 leading-relaxed">
              Para qualquer questão relacionada com estes Termos de Uso, entre em contato
              através do e-mail{' '}
              <span className="text-indigo-600 font-medium">suporte@opinaloop.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            ← Voltar à Página Inicial
          </Link>
        </div>
      </main>
    </div>
  )
}
