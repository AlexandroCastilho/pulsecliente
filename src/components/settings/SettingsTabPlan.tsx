"use client"

import { CreditCard } from 'lucide-react'

interface SettingsTabPlanProps {
  currentPlan: string
  assinaturaAtiva: boolean
  onManageSubscription?: () => void
  onCheckoutPlan?: (plan: 'GROWTH' | 'PREMIUM') => void
  billingLoading?: boolean
  checkoutPlanLoading?: 'GROWTH' | 'PREMIUM' | null
}

interface PlanCardProps {
  title: string
  price: string
  features: string[]
  buttonLabel: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  highlighted?: boolean
  current?: boolean
}

function PlanCard({
  title,
  price,
  features,
  buttonLabel,
  onClick,
  loading,
  disabled,
  highlighted,
  current,
}: PlanCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 ${highlighted ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'} ${
        current ? 'bg-indigo-50/40' : 'bg-white'
      }`}
    >
      <div className="space-y-2 mb-5">
        <h4 className="text-sm font-black tracking-widest text-gray-900 uppercase">{title}</h4>
        <p className="text-2xl font-black text-gray-900">{price}</p>
      </div>

      <ul className="space-y-2 mb-6">
        {features.map((feature) => (
          <li key={feature} className="text-sm text-gray-600 font-medium flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
          disabled || loading
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processando...
          </div>
        ) : (
          buttonLabel
        )}
      </button>
    </div>
  )
}

export function SettingsTabPlan({
  currentPlan,
  assinaturaAtiva,
  onManageSubscription,
  onCheckoutPlan,
  billingLoading,
  checkoutPlanLoading,
}: SettingsTabPlanProps) {
  return (
    <div className="space-y-6">
      {/* Gerenciar Assinatura */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Gerenciar Assinatura</h3>
              <p className="text-xs text-gray-500 font-medium">
                Acesse o portal para atualizar cartão, plano ou cancelar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onManageSubscription}
            disabled={billingLoading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              billingLoading
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {billingLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard size={14} />
                Gerenciar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Seleção de Planos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Planos Disponíveis</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Plano atual: <span className="font-bold text-indigo-600">{currentPlan}</span>
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <PlanCard
            title="FREE"
            price="R$ 0/mês"
            features={[
              'Até 100 envios por mês',
              'Dashboard básico',
              '1 usuário',
            ]}
            current={currentPlan === 'FREE'}
            buttonLabel="Plano atual"
            disabled
          />

          <PlanCard
            title="GROWTH"
            price="R$ 147/mês"
            highlighted
            features={[
              'Até 5.000 envios por mês',
              'Dashboard avançado',
              'Até 5 usuários',
              'Personalização de e-mail',
            ]}
            current={currentPlan === 'GROWTH'}
            buttonLabel={currentPlan === 'GROWTH' ? 'Plano atual' : 'Fazer upgrade'}
            onClick={() => onCheckoutPlan?.('GROWTH')}
            loading={checkoutPlanLoading === 'GROWTH'}
            disabled={currentPlan === 'GROWTH'}
          />

          <PlanCard
            title="PREMIUM"
            price="R$ 297/mês"
            features={[
              'Envios ilimitados',
              'Gestão avançada de equipe',
              'Suporte prioritário',
              'Personalização de e-mail',
            ]}
            current={currentPlan === 'PREMIUM'}
            buttonLabel={currentPlan === 'PREMIUM' ? 'Plano atual' : 'Fazer upgrade'}
            onClick={() => onCheckoutPlan?.('PREMIUM')}
            loading={checkoutPlanLoading === 'PREMIUM'}
            disabled={currentPlan === 'PREMIUM'}
          />
        </div>
      </div>

      {/* Info: Status da Assinatura */}
      {!assinaturaAtiva && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-sm font-bold text-red-900">
            ⚠️ Sua assinatura está inativa. Atualize seu pagamento para continuar utilizando recursos premium.
          </p>
        </div>
      )}
    </div>
  )
}
