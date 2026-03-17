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
  Activity
} from 'lucide-react'
import { logout } from '@/actions/auth'

interface SidebarProps {
  user: {
    nome: string
    email: string
    empresa: string
    iniciais: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 flex flex-col shadow-2xl z-20 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Activity className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">PulseCliente</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem href="/editor" icon={<PieChart size={20} />} label="Novo Editor" />
        <NavItem href="/pesquisas" icon={<Activity size={20} />} label="Minhas Pesquisas" />
        <NavItem href="/envios" icon={<Send size={20} />} label="Envios" />
        <NavItem href="/equipe" icon={<Users size={20} />} label="Equipe" />
        <NavItem href="/configuracoes" icon={<Settings size={20} />} label="Configurações" />
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold border-2 border-slate-700 shadow-inner">
            {user.iniciais}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{user.nome}</span>
            <span className="text-xs text-slate-400 truncate">{user.empresa}</span>
          </div>
        </div>
        <form action={logout}>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group">
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
            Sair da conta
          </button>
        </form>
      </div>
    </aside>
  )
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group">
      <span className="group-hover:text-indigo-400 transition-colors">{icon}</span>
      {label}
    </Link>
  )
}
