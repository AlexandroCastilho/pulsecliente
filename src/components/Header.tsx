"use client"

import { Search } from 'lucide-react'
import { NotificationDropdown } from './NotificationDropdown'

export function Header() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
      <div className="flex-1 flex max-w-md items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100/30 transition-all group">
        <Search className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-indigo-500" />
        <input 
          type="text" 
          placeholder="Buscar pesquisas, clientes..." 
          className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400 text-gray-700"
        />
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />
      </div>
    </header>
  )
}
