"use client"

import React, { useState, useRef } from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  defaultTab?: string
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const tabListRef = useRef<HTMLDivElement>(null)

  const activeTabData = tabs.find((tab) => tab.id === activeTab)
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newIndex = activeIndex

    switch (e.key) {
      case 'ArrowRight':
        newIndex = (activeIndex + 1) % tabs.length
        break
      case 'ArrowLeft':
        newIndex = (activeIndex - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = tabs.length - 1
        break
      default:
        return
    }

    // Pular desabilitadas
    let iterations = 0
    while (tabs[newIndex].disabled && iterations < tabs.length) {
      if (e.key === 'ArrowLeft') {
        newIndex = (newIndex - 1 + tabs.length) % tabs.length
      } else {
        newIndex = (newIndex + 1) % tabs.length
      }
      iterations++
    }

    if (!tabs[newIndex].disabled) {
      setActiveTab(tabs[newIndex].id)
      const buttons = tabListRef.current?.querySelectorAll('button')
      buttons?.[newIndex]?.focus()
    }
    
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div 
          ref={tabListRef}
          role="tablist"
          aria-label="Opções de navegação"
          onKeyDown={handleKeyDown}
          className="flex gap-2 min-w-max"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`inline-flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-0.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div 
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="animate-in fade-in slide-in-from-top-2 duration-300 outline-none"
        tabIndex={0}
      >
        {activeTabData?.content}
      </div>
    </div>
  )
}
