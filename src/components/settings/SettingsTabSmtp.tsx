"use client"

import { useState, useTransition } from 'react'
import { Mail, Server, Globe, User, Lock, ShieldCheck, HelpCircle, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
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

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      host: preset.host,
      port: preset.port
    }))
    setUseDefault(false)
    toast.success(`Configurações de ${preset.name} aplicadas!`, {
      description: "Lembre-se de preencher seu usuário e senha."
    })
  }

  const handleTestEmail = () => {
    if (!formData.host || !formData.user || !formData.pass) {
      toast.error("Preencha Host, Usuário e Senha para testar.")
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
            description: "Verifique sua caixa de entrada (e a pasta de spam)."
          })
        } else {
          toast.error("Falha no e-mail de teste", {
            description: res.error.message,
          })
        }
      } catch (err) {
        toast.error("Erro inesperado ao testar")
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Configuração SMTP</h3>
            <button 
              type="button"
              className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider hover:underline flex items-center gap-1 mt-0.5"
              onClick={() => document.getElementById('tutorial-trigger')?.click()}
            >
              Não sei meus dados de SMTP
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Fallback Toggle */}
           <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-indigo-200 transition-all">
              <input 
                type="checkbox" 
                checked={useDefault}
                onChange={(e) => setUseDefault(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">Servidor Padrão</span>
           </label>

          <span
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
              smtp?.host && !useDefault ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {smtp?.host && !useDefault ? 'Personalizado' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Quick Config */}
      {!useDefault && (
        <div className="px-8 pt-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Configuração Rápida</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 transition-all flex items-center gap-2"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${useDefault ? 'opacity-40 grayscale pointer-events-none scale-[0.99] origin-top' : ''}`}>
        <TooltipProvider>
          {/* Host */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <Server size={14} className="text-gray-400" />
                Servidor Host
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={14} className="text-gray-300 group-hover:text-indigo-400 cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  O endereço do servidor de saída (ex: smtp.gmail.com)
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
            />
          </div>

          {/* Port */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                Porta SMTP
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={14} className="text-gray-300 group-hover:text-indigo-400 cursor-help transition-colors" />
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
              onChange={(e) => handleFieldChange('port', parseInt(e.target.value))}
              placeholder="587"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
            />
          </div>

          {/* User */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User size={14} className="text-gray-400" />
              Usuário SMTP
            </label>
            <input
              type="text"
              name="user"
              value={formData.user || ''}
              onChange={(e) => handleFieldChange('user', e.target.value)}
              placeholder="E-mail ou API Key"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
            />
          </div>

          {/* Pass */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-gray-400" />
                Senha / Token
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={14} className="text-gray-300 group-hover:text-indigo-400 cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Gere uma "Senha de Aplicativo" para Gmail ou Outlook.
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
            />
          </div>
        </TooltipProvider>

        {/* Sender Info */}
        <div className="space-y-4 md:col-span-2 pt-6 border-t border-gray-100 mt-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                  <ShieldCheck size={14} className="text-indigo-500" />
                  Nome do Remetente
                </label>
                <input
                  type="text"
                  name="fromName"
                  value={formData.fromName || ''}
                  onChange={(e) => handleFieldChange('fromName', e.target.value)}
                  placeholder="Ex: Equipe OpinaLoop"
                  className="w-full px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50/20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                  <Mail size={14} className="text-indigo-500" />
                  E-mail do Remetente
                </label>
                <input
                  type="text"
                  name="fromEmail"
                  value={formData.fromEmail || ''}
                  onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
                  placeholder="Ex: contato@opinaloop.com.br"
                  className="w-full px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50/20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
                />
              </div>
           </div>
          <p className="text-[10px] text-indigo-400 font-medium italic flex items-center gap-1.5 pl-1">
            <CheckCircle2 size={12} />
            E-mails enviados de endereços não autorizados podem cair no spam.
          </p>
        </div>

        {/* Test Connection Button */}
        <div className="md:col-span-2 flex justify-center pt-4">
           <button
             type="button"
             disabled={isPending}
             onClick={handleTestEmail}
             className="px-6 py-3 border-2 border-indigo-100 hover:border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
           >
             {isPending ? (
               <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
             ) : (
               <Send size={16} />
             )}
             Enviar E-mail de Teste
           </button>
        </div>
      </div>

      {/* Hidden inputs for the main form to pick up if usedefault is OFF */}
      {useDefault && <input type="hidden" name="host" value="" />}
      
      {/* Tutorial Dialog */}
      <Dialog>
         <DialogTrigger id="tutorial-trigger" className="hidden" />
         <DialogContent className="max-w-2xl">
            <DialogHeader>
               <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="text-indigo-600" />
                  Guia de Configuração SMTP
               </DialogTitle>
               <DialogDescription>
                  Encontre os dados necessários nos provedores mais comuns:
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4 max-h-[60vh] overflow-y-auto pr-2">
               {/* Gmail */}
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">G</span>
                     <h4 className="font-bold text-slate-900">Configurando Gmail</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                     <li><strong>Host:</strong> smtp.gmail.com | <strong>Porta:</strong> 587</li>
                     <li><strong>Segurança:</strong> Ative a <strong>Verificação em Duas Etapas</strong> na sua Conta Google.</li>
                     <li>Vá em Segurança &gt; Senhas de App e gere uma nova senha chamada "OpinaLoop".</li>
                     <li>Use essa senha de 16 dígitos no campo "Senha" aqui no sistema.</li>
                  </ul>
               </div>

               {/* Outlook */}
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">O</span>
                     <h4 className="font-bold text-slate-900">Outlook / Hotmail</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                     <li><strong>Host:</strong> smtp.office365.com | <strong>Porta:</strong> 587</li>
                     <li>Também requer <strong>Senha de Aplicativo</strong> se a verificação em duas etapas estiver ativa.</li>
                     <li>Vá nas configurações da conta Microsoft &gt; Segurança &gt; Opções de segurança avançadas.</li>
                  </ul>
               </div>

                {/* Locaweb/Outros */}
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                     <ExternalLink size={16} className="text-indigo-600" />
                     <h4 className="font-bold text-slate-900">Outros (Locaweb, Hostgator, etc)</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                     Geralmente o host é <code>smtp.seu-dominio.com.br</code>. Verifique no painel de controle do seu provedor de e-mail na seção "Contas de E-mail" ou "Configurações de cliente".
                  </p>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}
