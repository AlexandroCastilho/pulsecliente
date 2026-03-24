
"use client"

import { useState, useEffect } from 'react'
import { 
  AlertCircle,
  Mail,
  Settings,
  CreditCard,
  UserCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { criarCheckoutAssinatura, getSettingsData, saveSettings } from '@/actions/settings'
import { Tabs, TabItem } from '@/components/Tabs'
import { SettingsTabProfile } from '@/components/settings/SettingsTabProfile'
import { SettingsTabCompany } from '@/components/settings/SettingsTabCompany'
import { SettingsTabSmtp } from '@/components/settings/SettingsTabSmtp'
import { SettingsTabPlan } from '@/components/settings/SettingsTabPlan'

interface SmtpData {
  id: string
  host: string
  port: number
  user: string | null
  pass: string
  fromName: string | null
  fromEmail: string | null
}

interface SettingsData {
  user: { nome: string | null; email: string }
  empresa: {
    nome: string
    logo: string | null
    id: string
    plano: string
    assinaturaAtiva: boolean
    emailBrandColor: string | null
    emailLogoUrl: string | null
    emailHeaderText: string | null
  }
  smtp: SmtpData | null
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [checkoutPlanLoading, setCheckoutPlanLoading] = useState<'GROWTH' | 'PREMIUM' | null>(null)
  const [data, setData] = useState<SettingsData | null>(null)

  useEffect(() => {
    async function loadData() {
      const settings = await getSettingsData()
      if (settings) setData(settings)
    }
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await saveSettings(formData)
      if (!res.success) {
        const errMessage = 'error' in res && res.error ? res.error.message : 'Tente novamente em instantes.'
        toast.error("Erro ao salvar", { description: errMessage })
        return
      }

      toast.success("Configurações salvas com sucesso!", {
        description: "Os dados do seu perfil e da empresa foram atualizados."
      })
      
      // Recarrega os dados para garantir que a UI está em sincronia
      const updated = await getSettingsData()
      if (updated) setData(updated)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar", {
        description: "Não foi possível persistir as alterações. Tente novamente."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setBillingLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Não foi possível abrir o portal de assinatura')
      }

      window.location.href = result.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível abrir o portal de assinatura'
      toast.error('Erro ao abrir assinatura', {
        description: message,
      })
    } finally {
      setBillingLoading(false)
    }
  }

  const handleCheckoutPlan = async (plan: 'GROWTH' | 'PREMIUM') => {
    setCheckoutPlanLoading(plan)
    try {
      const res = await criarCheckoutAssinatura(plan)
      if (!res.success) {
        const errMessage = res.error?.message ?? 'Tente novamente em instantes.'
        toast.error('Erro ao iniciar checkout', { description: errMessage })
        return
      }

      const checkoutData = res.data as { url?: string } | null
      if (!checkoutData?.url) {
        toast.error('Erro ao iniciar checkout', {
          description: 'Houve um problema ao gerar o link de pagamento. Tente novamente.',
        })
        return
      }

      window.location.href = checkoutData.url
    } finally {
      setCheckoutPlanLoading(null)
    }
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        <div className="bg-white h-96 rounded-3xl border border-gray-100 mt-8" />
      </div>
    )
  }

  const tabs: TabItem[] = [
    {
      id: 'perfil',
      label: 'Perfil',
      icon: <UserCircle size={18} />,
      content: (
        <SettingsTabProfile
          userName={data.user.nome ?? undefined}
          userEmail={data.user.email}
        />
      ),
    },
    {
      id: 'empresa',
      label: 'Empresa',
      icon: <Settings size={18} />,
      content: (
        <SettingsTabCompany
          companyName={data.empresa.nome}
          companyLogo={data.empresa.logo ?? undefined}
          emailBrandColor={data.empresa.emailBrandColor ?? undefined}
          emailLogoUrl={data.empresa.emailLogoUrl ?? undefined}
          emailHeaderText={data.empresa.emailHeaderText ?? undefined}
          plan={data.empresa.plano}
        />
      ),
    },
    {
      id: 'email',
      label: 'E-mail (SMTP)',
      icon: <Mail size={18} />,
      content: (
        <SettingsTabSmtp
          smtp={data.smtp ?? undefined}
        />
      ),
    },
    {
      id: 'planos',
      label: 'Plano',
      icon: <CreditCard size={18} />,
      content: (
        <SettingsTabPlan
          currentPlan={data.empresa.plano}
          assinaturaAtiva={data.empresa.assinaturaAtiva}
          onManageSubscription={handleManageSubscription}
          onCheckoutPlan={handleCheckoutPlan}
          billingLoading={billingLoading}
          checkoutPlanLoading={checkoutPlanLoading}
        />
      ),
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h1>
        <p className="text-base text-gray-600 font-medium mt-2">
          Gerencie as informações da sua conta, empresa, infraestrutura de disparo e plano de assinatura.
        </p>
      </div>

      {/* Tabs Navigation and Content */}
      <form onSubmit={handleSave} className="space-y-8">
        <Tabs tabs={tabs} defaultTab="perfil" />

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-medium">
            As alterações serão aplicadas imediatamente após salvar.
          </p>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg ${
              loading
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Alterações
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start">
        <div className="p-3 bg-white rounded-lg text-amber-500 shadow-sm border border-amber-150 shrink-0">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">
            🔒 Segurança da Infraestrutura
          </h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            Ao configurar o SMTP, certifique-se de usar <strong>App Passwords</strong> (Senhas de Aplicativo) caso utilize Gmail ou Outlook.
            Para envios em massa, recomendamos provedores dedicados como <strong>Resend</strong>, <strong>Amazon SES</strong> ou <strong>SendGrid</strong> para garantir deliverability.
          </p>
        </div>
      </div>

      {/* Additional Info Alert */}
      {data.empresa.plano === 'FREE' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start">
          <div className="p-3 bg-white rounded-lg text-indigo-600 shadow-sm border border-indigo-150 shrink-0">
            <CreditCard size={24} />
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-wider">
              ⚡ Desbloqueie Funcionalidades Premium
            </h4>
            <p className="text-sm text-indigo-800 leading-relaxed">
              Você está no plano <strong>FREE</strong>. Faça upgrade para <strong>GROWTH</strong> ou <strong>PREMIUM</strong> para acessar 
              personalização avançada de e-mails, mais envios por mês e recursos exclusivos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
