"use client"

import Link from 'next/link'
import {
  LayoutDashboard,
  PieChart,
  Send,
  Users,
  Mail,
  Settings,
  LogOut,
  Activity,
  Infinity
} from 'lucide-react'
import { logout } from '@/actions/auth'

interface SidebarProps {
  user: {
    nome: string
    email: string
    empresa: string
    iniciais: string
  }
  isMobile?: boolean
}

export function Sidebar({ user, isMobile }: SidebarProps) {
  return (
    <aside className={`${isMobile ? 'w-full' : 'w-64'} bg-slate-900 flex flex-col h-full shadow-2xl z-20 transition-all duration-300`}>
      {!isMobile && (
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Infinity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Opinaloop</span>
        </div>
      )}

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem href="/editor" icon={<PieChart size={20} />} label="Criar Pesquisa" />
        <NavItem href="/pesquisas" icon={<Activity size={20} />} label="Minhas Pesquisas" />
        <NavItem href="/envios" icon={<Send size={20} />} label="Envios" />
        <NavItem href="/equipe" icon={<Users size={20} />} label="Equipe" />
        <NavItem href="/configuracoes" icon={<Settings size={20} />} label="Configurações" />
        
        <div className="pt-4 mt-4 border-t border-slate-800/50">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all group cursor-pointer"
          >
            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            Sair da Conta
          </button>
        </div>

        {/* Info do Usuário no Mobile (Opcional) */}
        {isMobile && (
          <div className="p-6 border-t border-slate-800/50 flex items-center gap-3 mt-auto">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                {user.iniciais}
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{user.nome}</span>
                <span className="text-[10px] text-slate-500 uppercase font-black">{user.empresa}</span>
             </div>
          </div>
        )}
      </nav>
    </aside>
  )
}

// Sidebar atualizada para nova estrutura de navegação e labels consistentes.

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group">
      <span className="group-hover:text-indigo-400 transition-colors">{icon}</span>
      {label}
    </Link>
  )
}
