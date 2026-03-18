"use client"

import Link from 'next/link'
import { Search, Settings, User as UserIcon } from 'lucide-react'
import { NotificationDropdown } from './NotificationDropdown'
import { logout } from '@/actions/auth'

interface HeaderProps {
  user: {
    nome: string
    email: string
    empresa: string
    iniciais: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-10 shadow-sm shrink-0">
      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <NotificationDropdown />
        
        <div className="h-8 w-[1px] bg-gray-100" />

        <Link 
          href="/configuracoes"
          className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-2xl transition-all group"
        >
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
              {user.nome || "Admin"}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">
              {user.empresa || "Minha Empresa"}
            </span>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            {user.iniciais || "A"}
          </div>
        </Link>
      </div>
    </header>
  )
}
