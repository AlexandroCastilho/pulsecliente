"use client"

import { useState, useRef, useEffect, useTransition } from 'react'
import { MoreVertical, Shield, UserCog, Trash2, Power, UserCheck, Loader2 } from 'lucide-react'
import { updateMembroRole, toggleMembroStatus, removerMembro } from '@/actions/equipe'
import { Role } from '@prisma/client'
import { sanitizeErrorMessage } from '@/lib/error-handler'

interface MemberActionsProps {
  memberId: string
  currentRole: Role
  currentStatus: boolean
  isSelf: boolean
  onSuccess?: () => void
}

export function MemberActions({ memberId, currentRole, currentStatus, isSelf, onSuccess }: MemberActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAction = async (name: string, action: () => Promise<any>) => {
    setActiveAction(name)
    startTransition(async () => {
      try {
        const res = await action()
        if (res?.success) {
          setIsOpen(false)
          if(onSuccess) onSuccess()
        } else if (res?.error) {
          alert(res.error.message)
        }
      } catch (err: any) {
        alert(sanitizeErrorMessage(err) || "Erro ao realizar ação")
      } finally {
        setActiveAction(null)
      }
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            
            {/* Alterar Role */}
            {!isSelf && (
              <>
                <button 
                  onClick={() => handleAction('role', () => updateMembroRole(memberId, currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN'))}
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <UserCog size={16} className="text-gray-400" />
                    Tornar {currentRole === 'ADMIN' ? 'Membro' : 'Admin'}
                  </div>
                  {isPending && activeAction === 'role' && <Loader2 size={14} className="animate-spin text-indigo-500" />}
                </button>

                <button 
                  onClick={() => handleAction('owner', () => updateMembroRole(memberId, 'OWNER'))}
                  disabled={isPending || currentRole === 'OWNER'}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-indigo-500" />
                    Tornar Owner
                  </div>
                  {isPending && activeAction === 'owner' && <Loader2 size={14} className="animate-spin text-indigo-500" />}
                </button>

                <div className="h-px bg-gray-50 my-1" />
              </>
            )}

            {/* Alternar Status */}
            <button 
              onClick={() => handleAction('status', () => toggleMembroStatus(memberId, currentStatus))}
              disabled={isPending || isSelf}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${currentStatus ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            >
              <div className="flex items-center gap-3">
                <Power size={16} />
                {currentStatus ? 'Desativar Acesso' : 'Ativar Acesso'}
              </div>
              {isPending && activeAction === 'status' && <Loader2 size={14} className="animate-spin" />}
            </button>

            {/* Remover */}
            {!isSelf && (
              <button 
                onClick={() => {
                  if(confirm("Tem certeza que deseja remover este membro definitivamente?")) {
                    handleAction('delete', () => removerMembro(memberId))
                  }
                }}
                disabled={isPending}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={16} />
                  Remover da Equipe
                </div>
                {isPending && activeAction === 'delete' && <Loader2 size={14} className="animate-spin text-red-500" />}
              </button>
            )}

            {isSelf && (
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center italic">
                Sua própria conta
              </div>
            )}
            

          </div>
        </div>
      )}
    </div>
  )
}
