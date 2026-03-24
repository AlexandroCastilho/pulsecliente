"use client"

import { useState, useEffect, useRef } from 'react'
import { Bell, Info, Send } from 'lucide-react'
import { getNotificacoes, marcarComoLida, marcarTodasComoLidas } from '@/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notificacao {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: Date | string
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notificacoes.filter(n => !n.lida).length

  useEffect(() => {
    let isMounted = true

    async function fetchNotificacoes(showLoading = false) {
      if (showLoading) setLoading(true)
      const data = await getNotificacoes()
      if (isMounted) {
        setNotificacoes(data)
        setLoading(false)
      }
    }
    
    // Busca inicial
    fetchNotificacoes(true)

    // Polling a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchNotificacoes(false)
    }, 30000)

    // Fechar dropdown ao clicar fora ou pressionar ESC
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    
    return () => {
      isMounted = false
      clearInterval(intervalId)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleMarkAsRead = async (id: string) => {
    const res = await marcarComoLida(id)
    if (res.success) {
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
    }
  }

  const handleMarkAllAsRead = async () => {
    const res = await marcarTodasComoLidas()
    if (res.success) {
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    }
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'RESPOSTA': return <Info className="text-emerald-500" size={16} />
      case 'DISPARO': return <Send className="text-blue-500" size={16} />
      default: return <Bell className="text-indigo-500" size={16} />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : "Notificações"}
        className="relative p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Bell size={22} className={isOpen ? 'text-indigo-600' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-bounce" aria-hidden="true">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Ler todas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-10 text-center text-gray-400 text-sm italic">Carregando...</div>
            ) : notificacoes.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notificacoes.map((n) => (
                  <button 
                    key={n.id} 
                    className={`w-full p-5 hover:bg-gray-50 transition-colors relative group/item text-left focus:outline-none focus:bg-gray-50 ${!n.lida ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => !n.lida && handleMarkAsRead(n.id)}
                  >
                    <div className="flex gap-4">
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${!n.lida ? 'bg-white' : 'bg-gray-50'}`} aria-hidden="true">
                        {getIcon(n.tipo)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-bold leading-tight ${!n.lida ? 'text-gray-900' : 'text-gray-500'}`}>
                            {n.titulo}
                          </h4>
                          {!n.lida && <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1" aria-hidden="true"></span>}
                        </div>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                          {n.mensagem}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={24} className="opacity-20 translate-y-0.5" />
                </div>
                <p className="text-sm font-medium">Tudo limpo por aqui!</p>
                <p className="text-xs mt-1">Nenhuma notificação recente.</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50/30 border-t border-gray-50 text-center">
             <button className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
               Ver histórico completo
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
