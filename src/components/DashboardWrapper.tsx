"use client"

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Menu, X, Infinity } from 'lucide-react'

type DashboardUserData = {
  nome: string
  email: string
  empresa: string
  iniciais: string
}

interface DashboardWrapperProps {
  children: React.ReactNode
  userData: DashboardUserData
}

export function DashboardWrapper({ children, userData }: DashboardWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex">
        <Sidebar user={userData} />
      </div>

      {/* Sidebar Mobile (Overlay/Drawer) */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div 
          className={`w-72 h-full bg-slate-900 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Infinity className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Opinaloop</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <Sidebar user={userData} isMobile />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100">
           <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
           >
              <Menu size={24} />
           </button>

           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                 <Infinity className="text-white w-5 h-5" />
              </div>
           </div>
        </div>

        <Header user={userData} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
