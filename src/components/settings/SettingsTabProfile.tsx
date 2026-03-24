"use client"

import { UserCircle } from 'lucide-react'

interface SettingsTabProfileProps {
  userName: string
  userEmail: string
  onNameChange?: (value: string) => void
}

export function SettingsTabProfile({
  userName,
  userEmail,
  onNameChange,
}: SettingsTabProfileProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <UserCircle size={20} />
        </div>
        <h3 className="font-bold text-gray-900">Informações do Perfil</h3>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">O seu Nome</label>
          <input
            type="text"
            name="userName"
            defaultValue={userName}
            onChange={(e) => onNameChange?.(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-base font-medium text-gray-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">E-mail de Login</label>
          <input
            type="email"
            value={userEmail}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none text-sm font-medium"
            readOnly
          />
          <p className="text-[10px] text-gray-400 font-medium italic">
            O e-mail de login não pode ser alterado por aqui.
          </p>
        </div>
      </div>
    </div>
  )
}
