"use client"

import React, { useState } from 'react'

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

  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`inline-flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-0.5 ${
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

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {activeTabData?.content}
      </div>
    </div>
  )
}
