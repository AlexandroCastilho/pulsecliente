"use client"

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Mail, 
  Server, 
  Lock, 
  User, 
  Save, 
  AlertCircle,
  ShieldCheck,
  Globe,
  UserCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsData, saveSettings } from '@/actions/settings'

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

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
      if (res.success) {
        toast.success("Configurações salvas com sucesso!", {
          description: "Os dados do seu perfil e da empresa foram atualizados."
        })
        
        // Recarrega os dados para garantir que a UI está em sincronia
        const updated = await getSettingsData()
        if (updated) setData(updated)
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar", {
        description: "Não foi possível persistir as alterações. Tente novamente."
      })
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        <div className="bg-white h-64 rounded-3xl border border-gray-100 mt-8" />
        <div className="bg-white h-96 rounded-3xl border border-gray-100 mt-8" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações</h1>
        <p className="text-sm text-gray-500 font-medium">Gerencie a infraestrutura de disparo e as informações da sua conta.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Bloco 1: SEU PERFIL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <UserCircle size={20} />
            </div>
            <h3 className="font-bold text-gray-900">O Seu Perfil</h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">O seu Nome</label>
              <input 
                type="text" 
                name="userName"
                defaultValue={data.user.nome}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">E-mail de Login</label>
              <input 
                type="email" 
                value={data.user.email}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none text-sm font-medium"
                readOnly
              />
              <p className="text-[10px] text-gray-400 font-medium italic">O e-mail de login não pode ser alterado por aqui.</p>
            </div>
          </div>
        </div>

        {/* Bloco 2: INFRAESTRUTURA SMTP */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Mail size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Configuração de Disparo (SMTP)</h3>
            </div>
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${data.smtp ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {data.smtp ? 'Configurado' : 'Pendente'}
            </span>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Server size={14} className="text-gray-400" />
                Servidor Host
              </label>
              <input 
                type="text" 
                name="host"
                defaultValue={data.smtp?.host || ''}
                placeholder="ex: smtp.sendgrid.net"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                Porta SMTP
              </label>
              <input 
                type="number" 
                name="port"
                defaultValue={data.smtp?.port || 587}
                placeholder="587"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                Usuário SMTP
              </label>
              <input 
                type="text" 
                name="user"
                defaultValue={data.smtp?.user || ''}
                placeholder="apikey ou e-mail do servidor"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Lock size={14} className="text-gray-400" />
                Senha / App Token
              </label>
              <input 
                type="password" 
                name="pass"
                defaultValue={data.smtp?.pass || ''}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2 pt-4 border-t border-gray-50 mt-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-500" />
                Nome do Remetente
              </label>
              <input 
                type="text" 
                name="fromName"
                defaultValue={data.smtp?.fromName || ''}
                placeholder="Ex: Opinaloop"
                className="w-full px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Mail size={14} className="text-indigo-500" />
                E-mail do Remetente
              </label>
              <input 
                type="text" 
                name="fromEmail"
                defaultValue={data.smtp?.fromEmail || ''}
                placeholder="Ex: contato@opinaloop.com.br"
                className="w-full px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
              />
              <p className="text-[10px] text-indigo-400 font-medium italic">Este endereço deve estar autorizado no seu provedor de e-mail.</p>
            </div>
          </div>
        </div>

        {/* Bloco 3: DADOS DA EMPRESA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Settings size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Dados da Empresa (Tenant)</h3>
          </div>
          <div className="p-8">
             <div className="space-y-2 max-w-md">
              <label className="text-sm font-bold text-gray-700">Nome da Organização</label>
              <input 
                type="text" 
                name="companyName"
                defaultValue={data.empresa.nome}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
              loading 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-600/20 active:scale-95 hover:-translate-y-1'
            }`}
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                Guardar Alterações
              </>
            )}
          </button>
        </div>
      </form>

      {/* Alerta de Segurança */}
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-start">
        <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm border border-amber-100 shrink-0">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-black text-amber-900 leading-tight">Segurança da Infraestrutura</h4>
          <p className="text-sm text-amber-800/80 font-medium leading-relaxed">
            Ao configurar o SMTP, certifique-se de usar **App Passwords** (Senhas de Aplicativo) caso utilize Gmail ou Outlook. 
            Para envios em massa, recomendamos provedores dedicados como **Resend**, **Amazon SES** ou **SendGrid** para garantir que a sua pesquisa não caia no SPAM.
          </p>
        </div>
      </div>
    </div>
  )
}
