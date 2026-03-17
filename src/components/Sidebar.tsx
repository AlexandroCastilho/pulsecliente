import Link from 'next/link';
import { Home, PieChart, Send, Settings, Users } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 min-h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800 transition-all z-20">
      <div className="p-6">
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">P</div>
          Pulse<span className="text-indigo-400">Cliente</span>
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 font-medium transition-colors">
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/pesquisas" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
            <PieChart className="w-5 h-5" />
            Pesquisas
          </Link>
          <Link href="/envios" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
            <Send className="w-5 h-5" />
            Envios
          </Link>
          <Link href="/clientes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
            <Users className="w-5 h-5" />
            Clientes
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <Link href="/configuracoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
          <Settings className="w-5 h-5" />
          Configurações
        </Link>
        <div className="mt-4 flex items-center gap-3 px-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin</span>
            <span className="text-xs text-slate-400 truncate w-32">admin@empresa.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
