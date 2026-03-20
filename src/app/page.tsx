import Link from 'next/link'
import { Inter } from 'next/font/google'
import {
  Activity,
  ArrowRight,
  Check,
  Infinity,
  Mail,
  Smartphone,
  Users,
  Gauge,
  Star,
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${inter.className}`}>
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Infinity className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Opinaloop</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#funcionalidades" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
            <a href="#metodologia" className="hover:text-indigo-600 transition-colors">Metodologia NPS</a>
            <a href="#precos" className="hover:text-indigo-600 transition-colors">Preços</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all"
            >
              Login
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-slate-900 transition-all active:scale-95"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Plataforma de Customer Experience
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-slate-900">
                Entenda seus clientes de <span className="text-indigo-600">verdade</span>.
              </h1>
              
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                O Opinaloop ajuda sua empresa a coletar feedbacks valiosos, medir o NPS e tomar decisões baseadas em dados reais. Simples, rápido e eficiente.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="px-10 py-5 bg-indigo-600 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group active:scale-95"
                >
                  Criar Conta Grátis
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/login" 
                  className="px-10 py-5 bg-white text-slate-600 border-2 border-slate-100 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Ver Demonstração
                </Link>
              </div>

              <div className="pt-8 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                    +2k
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  <strong>+2,000 empresas</strong> já utilizam o Opinaloop para crescer.
                </p>
              </div>
            </div>

            <div className="relative animate-in zoom-in duration-1000">
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
               <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
               
               <div className="relative bg-white p-4 rounded-[40px] shadow-2xl border border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-50 rounded-[32px] p-8 space-y-6 overflow-hidden">
                     <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-400"></div>
                           <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                           <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opinaloop Dashboard</div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="h-8 bg-white rounded-xl shadow-sm w-3/4"></div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-32 bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between">
                              <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                                 <Activity size={16} />
                              </div>
                              <div className="space-y-1">
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">NPS Score</div>
                                 <div className="text-2xl font-black text-slate-900">84</div>
                              </div>
                           </div>
                           <div className="h-32 bg-indigo-600 rounded-3xl shadow-lg p-6 flex flex-col justify-between text-white">
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                 <Users size={16} />
                              </div>
                              <div className="space-y-1">
                                 <div className="text-[10px] text-indigo-100 font-bold uppercase">Feedback</div>
                                 <div className="text-2xl font-black">98%</div>
                              </div>
                           </div>
                        </div>
                        <div className="h-40 bg-white rounded-3xl shadow-sm p-6 space-y-4">
                           <div className="flex justify-between items-center">
                              <div className="h-4 bg-slate-100 rounded-full w-1/3"></div>
                              <div className="h-4 bg-indigo-50 rounded-full w-12 text-[10px] font-bold text-indigo-600 flex items-center justify-center">LIVE</div>
                           </div>
                           <div className="space-y-2">
                              <div className="h-2 bg-slate-50 rounded-full w-full"></div>
                              <div className="h-2 bg-slate-50 rounded-full w-5/6"></div>
                              <div className="h-2 bg-slate-50 rounded-full w-4/6"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <section id="funcionalidades" className="scroll-mt-28 pt-24">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Funcionalidades</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Tudo o que você precisa para escalar seu NPS</h2>
              <p className="text-slate-500 font-medium">Uma plataforma completa para disparar pesquisas, acompanhar resultados em tempo real e ativar seu time em torno da experiência do cliente.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Mail size={22} className="text-indigo-600" />}
                title="Disparos por E-mail Próprio"
                description="Configure seu SMTP e envie pesquisas com domínio e reputação da sua marca."
              />
              <FeatureCard
                icon={<Gauge size={22} className="text-indigo-600" />}
                title="Dashboard em Tempo Real"
                description="Acompanhe taxa de resposta, NPS e status dos envios com atualização contínua."
              />
              <FeatureCard
                icon={<Users size={22} className="text-indigo-600" />}
                title="Gestão de Equipa"
                description="Convide membros, organize permissões e mantenha toda a operação alinhada."
              />
              <FeatureCard
                icon={<Smartphone size={22} className="text-indigo-600" />}
                title="Mobile-First"
                description="Experiência otimizada para celular, com formulários rápidos e interface responsiva."
              />
            </div>
          </section>

          <section id="metodologia" className="scroll-mt-28 pt-24">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-12">
              <div className="max-w-3xl space-y-4 mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Metodologia NPS</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Promotor, Neutro e Detrator sem complicação</h2>
                <p className="text-slate-500 font-medium">O Opinaloop classifica respostas automaticamente e transforma a metodologia NPS em decisões acionáveis para o seu time.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <NpsCard
                  title="Promotor"
                  score="9–10"
                  description="Clientes leais, com alta chance de recomendação da sua marca."
                  tone="emerald"
                />
                <NpsCard
                  title="Neutro"
                  score="7–8"
                  description="Clientes satisfeitos, mas com baixa fidelidade competitiva."
                  tone="amber"
                />
                <NpsCard
                  title="Detrator"
                  score="0–6"
                  description="Clientes insatisfeitos com risco de churn e impacto na reputação."
                  tone="red"
                />
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm font-semibold text-slate-600">
                Cálculo simplificado no Opinaloop: <span className="text-emerald-600">% Promotores</span> - <span className="text-red-600">% Detratores</span> = <span className="text-indigo-600">NPS</span>
              </div>
            </div>
          </section>

          <section id="precos" className="scroll-mt-28 pt-24">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Preços</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Planos para cada estágio da sua operação</h2>
              <p className="text-slate-500 font-medium">Comece grátis e evolua conforme sua base de clientes e volume de pesquisas cresce.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <PricingCard
                plan="Plano Gratuito"
                price="R$ 0"
                subtitle="Ideal para começar"
                benefits={[
                  'Até 100 envios/mês',
                  'Dashboard básico',
                  '1 utilizador',
                  'Suporte por e-mail',
                ]}
              />

              <PricingCard
                plan="Plano Growth"
                price="R$ 147"
                subtitle="Para times em expansão"
                popular
                benefits={[
                  'Até 5.000 envios/mês',
                  'Dashboard avançado em tempo real',
                  'Até 5 utilizadores',
                  'Automação de disparos',
                ]}
              />

              <PricingCard
                plan="Plano Premium"
                price="R$ 297"
                subtitle="Escala com controle total"
                benefits={[
                  'Envios ilimitados',
                  'Gestão avançada de equipa',
                  'Múltiplos SMTPs',
                  'Suporte prioritário',
                ]}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Footer / Login Links */}
      <footer className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
           <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Infinity className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Opinaloop</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2026 Opinaloop - Todos os direitos reservados.</p>
          <div className="flex justify-center gap-8">
            <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-indigo-600">Esqueci minha senha</Link>
            <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-indigo-600">Políticas de Privacidade</Link>
            <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-indigo-600">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
    </article>
  )
}

function NpsCard({ title, score, description, tone }: { title: string; score: string; description: string; tone: 'emerald' | 'amber' | 'red' }) {
  const toneClasses = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  }[tone]

  return (
    <article className={`rounded-2xl border p-5 ${toneClasses}`}>
      <p className="text-xs font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black mb-2">{score}</p>
      <p className="text-sm font-semibold opacity-90 leading-relaxed">{description}</p>
    </article>
  )
}

function PricingCard({
  plan,
  price,
  subtitle,
  benefits,
  popular = false,
}: {
  plan: string
  price: string
  subtitle: string
  benefits: string[]
  popular?: boolean
}) {
  return (
    <article className={`relative rounded-3xl border bg-white p-8 shadow-sm ${popular ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'}`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Mais Popular
        </span>
      )}

      <div className="space-y-2 mb-6">
        <h3 className="text-xl font-black text-slate-900">{plan}</h3>
        <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
        <p className="text-4xl font-black text-slate-900">{price}<span className="text-sm font-semibold text-slate-500">/mês</span></p>
      </div>

      <ul className="space-y-3 mb-8">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3 text-sm text-slate-600 font-semibold">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/login"
        className={`w-full inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-colors ${popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
      >
        Começar agora
      </Link>
    </article>
  )
}
