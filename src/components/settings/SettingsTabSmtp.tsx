"use client"

import { useState, useTransition } from 'react'
import { Mail, Server, Globe, User, Lock, ShieldCheck, HelpCircle, Send, AlertCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/Tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { sendTestEmail } from '@/actions/mail-test'

interface SettingsTabSmtpProps {
  smtp?: {
    host: string
    port: number
    user: string | null
    pass: string
    fromName: string | null
    fromEmail: string | null
  }
}

const PRESETS = [
  { name: 'Gmail', host: 'smtp.gmail.com', port: 587 },
  { name: 'Outlook', host: 'smtp.office365.com', port: 587 },
  { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587 },
]

export function SettingsTabSmtp({ smtp }: SettingsTabSmtpProps) {
  const [formData, setFormData] = useState({
    host: smtp?.host || '',
    port: smtp?.port || 587,
    user: smtp?.user || '',
    pass: smtp?.pass || '',
    fromName: smtp?.fromName || '',
    fromEmail: smtp?.fromEmail || '',
  })

  const [useDefault, setUseDefault] = useState(!smtp?.host)
  const [isPending, startTransition] = useTransition()

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setFormData(prev => ({
      ...prev,
      host: preset.host,
      port: preset.port
    }))
    setUseDefault(false)
    toast.success(`Configuracoes de ${preset.name} aplicadas!`, {
      description: "Lembre-se de preencher seu usuario e senha."
    })
  }

  const handleTestEmail = () => {
    if (!formData.host || !formData.user || !formData.pass) {
      toast.error("Preencha Host, Usuario e Senha para testar.")
      return
    }

    startTransition(async () => {
      try {
        const res = await sendTestEmail({
          ...formData,
          port: Number(formData.port),
          user: formData.user || '',
          pass: formData.pass || '',
          fromName: formData.fromName || 'OpinaLoop',
          fromEmail: formData.fromEmail || 'contato@opinaloop.com.br'
        })

        if (res.success) {
          toast.success("E-mail de teste enviado!", {
            description: "Verifique sua caixa de entrada e a pasta de spam."
          })
        } else {
          toast.error("Falha no e-mail de teste", {
            description: res.error.message,
          })
        }
      } catch {
        toast.error("Erro inesperado ao testar")
      }
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="leading-tight font-bold text-gray-900">Configuracao SMTP</h3>
            <button
              type="button"
              className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:underline"
              onClick={() => document.getElementById('tutorial-trigger')?.click()}
            >
              Nao sei meus dados de SMTP
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm transition-all hover:border-indigo-200">
            <input
              type="checkbox"
              checked={useDefault}
              onChange={(e) => setUseDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">Servidor Padrao</span>
          </label>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest ${
              smtp?.host && !useDefault ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {smtp?.host && !useDefault ? 'Personalizado' : 'Inativo'}
          </span>
        </div>
      </div>

      {!useDefault && (
        <div className="px-8 pt-6">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Configuracao Rapida</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6 p-8 transition-all duration-300 md:grid-cols-2 ${useDefault ? 'pointer-events-none origin-top scale-[0.99] opacity-40 grayscale' : ''}`}>
        <TooltipProvider>
          <div className="space-y-2">
            <label className="group flex items-center justify-between text-sm font-bold text-gray-700">
              <div className="flex items-center gap-2">
                <Server size={14} className="text-gray-400" />
                Servidor Host
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={14} className="cursor-help text-gray-300 transition-colors group-hover:text-indigo-400" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  O endereco do servidor de saida, por exemplo smtp.gmail.com.
                </TooltipContent>
              </Tooltip>
            </label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={(e) => handleFieldChange('host', e.target.value)}
              placeholder="ex: smtp.sendgrid.net"
              autoComplete="off"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="group flex items-center justify-between text-sm font-bold text-gray-700">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                Porta SMTP
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={14} className="cursor-help text-gray-300 transition-colors group-hover:text-indigo-400" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Use 587 para TLS ou 465 para SSL.
                </TooltipContent>
              </Tooltip>
            </label>
            <input
              type="number"
              name="port"
              value={formData.port}
              onChange={(e) => handleFieldChange('port', parseInt(e.target.value, 10) || 0)}
              placeholder="587"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <User size={14} className="text-gray-400" />
              Usuario SMTP
            </label>
            <input
              type="text"
              name="user"
              value={formData.user || ''}
              onChange={(e) => handleFieldChange('user', e.target.value)}
              placeholder="E-mail ou API Key"
              autoComplete="off"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="group flex items-center justify-between text-sm font-bold text-gray-700">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-gray-400" />
                Senha / Token
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={14} className="cursor-help text-gray-300 transition-colors group-hover:text-indigo-400" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Gere uma &quot;Senha de Aplicativo&quot; para Gmail ou Outlook.
                </TooltipContent>
              </Tooltip>
            </label>
            <input
              type="password"
              name="pass"
              value={formData.pass}
              onChange={(e) => handleFieldChange('pass', e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </TooltipProvider>

        <div className="mt-2 space-y-4 border-t border-gray-100 pt-6 md:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="mb-1 flex items-center gap-2 pl-1 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <ShieldCheck size={14} className="text-indigo-500" />
                Nome do Remetente
              </label>
              <input
                type="text"
                name="fromName"
                value={formData.fromName || ''}
                onChange={(e) => handleFieldChange('fromName', e.target.value)}
                placeholder="Ex: Equipe OpinaLoop"
                className="w-full rounded-xl border border-indigo-100 bg-indigo-50/20 px-4 py-3 text-base font-medium text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="mb-1 flex items-center gap-2 pl-1 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <Mail size={14} className="text-indigo-500" />
                E-mail do Remetente
              </label>
              <input
                type="text"
                name="fromEmail"
                value={formData.fromEmail || ''}
                onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
                placeholder="Ex: contato@opinaloop.com.br"
                className="w-full rounded-xl border border-indigo-100 bg-indigo-50/20 px-4 py-3 text-base font-medium text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">Atencao a Entregabilidade (Gmail/Yahoo)</p>
              <p className="text-xs leading-relaxed text-amber-700">
                Para evitar erros de <strong>politica (5.7.1)</strong>, certifique-se de que o <strong>E-mail do Remetente</strong> seja o mesmo do <strong>Usuario SMTP</strong>. Alem disso, verifique se o seu dominio possui registros <strong>SPF, DKIM e DMARC</strong> configurados corretamente.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 md:col-span-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleTestEmail}
            className="flex items-center gap-2 rounded-2xl border-2 border-indigo-100 px-6 py-3 text-xs font-black uppercase tracking-widest text-indigo-600 transition-all hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 active:scale-95"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            ) : (
              <Send size={16} />
            )}
            Enviar E-mail de Teste
          </button>
        </div>
      </div>

      {useDefault && <input type="hidden" name="host" value="" />}

      <Dialog>
        <DialogTrigger id="tutorial-trigger" className="hidden" />
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <HelpCircle className="text-indigo-600" />
              Guia de Configuracao SMTP
            </DialogTitle>
            <DialogDescription>
              Encontre os dados necessarios nos provedores mais comuns:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] space-y-6 overflow-y-auto pr-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">G</span>
                <h4 className="font-bold text-slate-900">Configurando Gmail</h4>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li><strong>Host:</strong> smtp.gmail.com | <strong>Porta:</strong> 587</li>
                <li><strong>Seguranca:</strong> Ative a <strong>Verificacao em Duas Etapas</strong> na sua Conta Google.</li>
                <li>Va em Seguranca &gt; Senhas de App e gere uma nova senha chamada &quot;OpinaLoop&quot;.</li>
                <li>Use essa senha de 16 digitos no campo &quot;Senha&quot; aqui no sistema.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">O</span>
                <h4 className="font-bold text-slate-900">Outlook / Hotmail</h4>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li><strong>Host:</strong> smtp.office365.com | <strong>Porta:</strong> 587</li>
                <li>Tambem requer <strong>Senha de Aplicativo</strong> se a verificacao em duas etapas estiver ativa.</li>
                <li>Va nas configuracoes da conta Microsoft &gt; Seguranca &gt; Opcoes de seguranca avancadas.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <ExternalLink size={16} className="text-indigo-600" />
                <h4 className="font-bold text-slate-900">Outros (Locaweb, Hostgator, etc)</h4>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Geralmente o host e <code>smtp.seu-dominio.com.br</code>. Verifique no painel de controle do seu provedor de e-mail na secao &quot;Contas de E-mail&quot; ou &quot;Configuracoes de cliente&quot;.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
