"use client"

import { useState } from 'react'
import { X, UserPlus, Mail, Shield, Loader2 } from 'lucide-react'
import { addMembro } from '@/actions/equipe'

export function AddMemberModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await addMembro(formData)
      if (res.success) {
        onClose()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar membro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <UserPlus size={20} />
             </div>
             <h3 className="font-bold text-gray-900">Novo Membro</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
               <AlertCircle size={14} />
               {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Nome Completo</label>
            <div className="relative">
              <input 
                name="nome"
                type="text" 
                required
                placeholder="Ex: João Silva"
                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                name="email"
                type="email" 
                required
                placeholder="joao@empresa.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Função na Equipe</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                name="role"
                defaultValue="MEMBER"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="MEMBER">Membro (Visualização)</option>
                <option value="ADMIN">Admin (Gestão)</option>
                <option value="OWNER">Owner (Total)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <UserPlus size={18} />
                  Adicionar à Equipe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AlertCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  )
}
