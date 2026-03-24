"use client"

import { Building2, Image as ImageIcon, Lock, Palette } from 'lucide-react'
import NextImage from 'next/image'

interface SettingsTabCompanyProps {
  companyName: string
  companyLogo?: string
  emailBrandColor?: string
  emailLogoUrl?: string
  emailHeaderText?: string
  plan: string
  onCompanyNameChange?: (value: string) => void
  onCompanyLogoChange?: (value: string) => void
  onEmailBrandColorChange?: (value: string) => void
  onEmailLogoUrlChange?: (value: string) => void
  onEmailHeaderTextChange?: (value: string) => void
}

export function SettingsTabCompany({
  companyName,
  companyLogo,
  emailBrandColor,
  emailLogoUrl,
  emailHeaderText,
  plan,
  onCompanyNameChange,
  onCompanyLogoChange,
  onEmailBrandColorChange,
  onEmailLogoUrlChange,
  onEmailHeaderTextChange,
}: SettingsTabCompanyProps) {
  const isPremium = plan !== 'FREE'
  const isReadOnly = !isPremium

  return (
    <div className="space-y-6">
      {/* Seção: Informações Básicas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Building2 size={20} />
          </div>
          <h3 className="font-bold text-gray-900">Informações da Empresa</h3>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Nome da Organização</label>
            <input
              type="text"
              name="companyName"
              defaultValue={companyName}
              onChange={(e) => onCompanyNameChange?.(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">URL da Logomarca</label>
            <input
              type="url"
              name="companyLogo"
              defaultValue={companyLogo || ''}
              onChange={(e) => onCompanyLogoChange?.(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Seção: Personalização de E-mail (Premium) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        {isReadOnly && (
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="bg-white rounded-xl px-6 py-4 flex flex-col items-center gap-3 shadow-xl">
              <Lock size={32} className="text-amber-500" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">Recurso Premium</p>
                <p className="text-xs text-gray-500 mt-1">Faça upgrade para personalizar e-mails</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Palette size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Personalização de E-mail</h3>
          </div>
          {isReadOnly && (
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 rounded-full">
              Pro
            </span>
          )}
        </div>

        <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-6 ${isReadOnly ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Palette size={14} className="text-purple-500" />
              Cor Principal do E-mail
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="emailBrandColor"
                defaultValue={emailBrandColor}
                onChange={(e) => onEmailBrandColorChange?.(e.target.value)}
                disabled={isReadOnly}
                className="w-16 h-12 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={emailBrandColor}
                onChange={(e) => onEmailBrandColorChange?.(e.target.value)}
                disabled={isReadOnly}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ImageIcon size={14} className="text-purple-500" />
              Logo do E-mail
            </label>
            <input
              type="url"
              name="emailLogoUrl"
              defaultValue={emailLogoUrl || ''}
              onChange={(e) => onEmailLogoUrlChange?.(e.target.value)}
              placeholder="https://exemplo.com/logo-email.png"
              disabled={isReadOnly}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900"
            />
            <p className="text-[10px] text-gray-400 font-medium italic">
              Recomendado: 200x50px para melhor visualização
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-gray-700">Texto do Cabeçalho</label>
            <textarea
              name="emailHeaderText"
              defaultValue={emailHeaderText || ''}
              onChange={(e) => onEmailHeaderTextChange?.(e.target.value)}
              disabled={isReadOnly}
              placeholder="Ex: Bem-vindo! Sua opinião é muito importante para nós."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base text-gray-900 resize-none"
            />
            <p className="text-[10px] text-gray-400 font-medium italic">
              Máximo de 200 caracteres. Este texto aparecerá no topo de cada e-mail enviado.
            </p>
          </div>

          {/* Preview */}
          <div className="md:col-span-2 pt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-4">Pré-visualização</p>
            <div
              className="rounded-xl border-2 p-6 space-y-4"
              style={{ borderColor: emailBrandColor }}
            >
              {emailLogoUrl && (
                <NextImage
                  src={emailLogoUrl}
                  alt="Vista prévia do logo"
                  width={200}
                  height={48}
                  className="max-h-12 w-auto object-contain"
                  unoptimized
                />
              )}
              <div style={{ color: emailBrandColor }}>
                <p className="font-bold text-sm">{emailHeaderText || 'Seu texto de cabeçalho aqui...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
