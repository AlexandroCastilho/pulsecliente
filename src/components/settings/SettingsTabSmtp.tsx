"use client"

import { Mail, Server, Globe, User, Lock, ShieldCheck } from 'lucide-react'

interface SettingsTabSmtpProps {
  smtp?: {
    host: string
    port: number
    user: string | null
    pass: string
    fromName: string | null
    fromEmail: string | null
  }
  onSmtpChange?: (field: string, value: string | number) => void
}

export function SettingsTabSmtp({ smtp, onSmtpChange }: SettingsTabSmtpProps) {
  const handleChange = (field: string, value: string | number) => {
    onSmtpChange?.(field, value)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Mail size={20} />
          </div>
          <h3 className="font-bold text-gray-900">Configuração SMTP</h3>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
            smtp?.host ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {smtp?.host ? 'Configurado' : 'Pendente'}
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
            defaultValue={smtp?.host || ''}
            onChange={(e) => handleChange('host', e.target.value)}
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
            defaultValue={smtp?.port || 587}
            onChange={(e) => handleChange('port', parseInt(e.target.value))}
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
            defaultValue={smtp?.user || ''}
            onChange={(e) => handleChange('user', e.target.value)}
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
            defaultValue={smtp?.pass || ''}
            onChange={(e) => handleChange('pass', e.target.value)}
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
            defaultValue={smtp?.fromName || ''}
            onChange={(e) => handleChange('fromName', e.target.value)}
            placeholder="Ex: OpinaLoop"
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
            defaultValue={smtp?.fromEmail || ''}
            onChange={(e) => handleChange('fromEmail', e.target.value)}
            placeholder="Ex: contato@opinaloop.com.br"
            className="w-full px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
          />
          <p className="text-[10px] text-indigo-400 font-medium italic">
            Este endereço deve estar autorizado no seu provedor de e-mail.
          </p>
        </div>
      </div>
    </div>
  )
}
