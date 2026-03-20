import Link from 'next/link'
import type { Metadata } from 'next'
import { Infinity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade - Opinaloop',
  description: 'Saiba como o Opinaloop recolhe, usa e protege os seus dados pessoais.',
  robots: 'index, follow',
}

export default function PrivacidadePage() {
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
        <h1 className="text-4xl font-black text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-slate-400 mb-12">Última atualização: março de 2026</p>

        <div className="prose prose-slate max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Introdução</h2>
            <p className="text-slate-600 leading-relaxed">
              A sua privacidade é importante para nós. Esta Política de Privacidade descreve
              como o Opinaloop recolhe, usa, armazena e protege as suas informações pessoais
              quando utiliza a nossa plataforma. Ao utilizar o Opinaloop, concorda com as
              práticas descritas nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Dados que Recolhemos</h2>
            <p className="text-slate-600 leading-relaxed">
              Recolhemos as seguintes categorias de dados:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-slate-600">
              <li><strong>Dados de conta:</strong> nome, endereço de e-mail e senha (armazenada com hash seguro).</li>
              <li><strong>Dados da empresa:</strong> nome da organização e informações de faturação.</li>
              <li><strong>Dados operacionais:</strong> listas de contactos carregadas, respostas às pesquisas e registos de envios.</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, páginas visitadas e duração das sessões.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Como Usamos os Seus Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Os seus dados são utilizados para: prestar e melhorar os nossos serviços,
              processar pagamentos e gerir subscrições, enviar comunicações de serviço
              relacionadas com a sua conta, analisar o uso da plataforma para otimização de
              funcionalidades, e cumprir obrigações legais e regulatórias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Base Legal para o Tratamento</h2>
            <p className="text-slate-600 leading-relaxed">
              Tratamos os seus dados pessoais com base nas seguintes bases legais: execução
              contratual (para prestar os serviços contratados), interesse legítimo (para
              melhorar a plataforma e prevenir fraudes), cumprimento de obrigação legal, e
              consentimento explícito quando aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Partilha de Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Não vendemos os seus dados pessoais. Podemos partilhar informações com
              fornecedores de serviços que nos auxiliam na operação da plataforma (como
              processadores de pagamento e serviços de infraestrutura em nuvem), sempre sob
              acordos de confidencialidade e proteção de dados adequados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Seus Direitos</h2>
            <p className="text-slate-600 leading-relaxed">
              Nos termos da LGPD e do GDPR, tem direito a: aceder aos seus dados pessoais,
              solicitar a correção de dados incorretos, solicitar a eliminação dos seus dados,
              opor-se ao tratamento dos seus dados, e solicitar a portabilidade dos seus dados.
              Para exercer estes direitos, contacte-nos através de{' '}
              <span className="text-indigo-600 font-medium">privacidade@opinaloop.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Retenção de Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Mantemos os seus dados pessoais pelo tempo necessário para prestar os serviços
              contratados e cumprir obrigações legais. Após o cancelamento da conta, os dados
              são eliminados ou anonimizados no prazo de 90 dias, salvo obrigação legal de
              retenção por período superior.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Segurança</h2>
            <p className="text-slate-600 leading-relaxed">
              Implementamos medidas técnicas e organizacionais adequadas para proteger os seus
              dados contra acesso não autorizado, alteração, divulgação ou destruição, incluindo
              encriptação em trânsito (TLS) e em repouso, controlo de acessos por função e
              monitorização de segurança contínua.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Contacto</h2>
            <p className="text-slate-600 leading-relaxed">
              Para questões sobre esta Política de Privacidade, entre em contacto com o nosso
              Encarregado de Proteção de Dados (DPO) em{' '}
              <span className="text-indigo-600 font-medium">privacidade@opinaloop.com</span>.
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
