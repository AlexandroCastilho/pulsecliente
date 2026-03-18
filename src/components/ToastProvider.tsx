"use client"

import { ReactNode } from 'react'
import { Toaster as SonnerToaster } from 'sonner'

export function ToasterProvider() {
  return (
    <SonnerToaster 
      position="top-right"
      expand={false}
      richColors
      closeButton
      theme="light"
      toastOptions={{
        style: {
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        },
        className: 'font-sans font-medium',
      }}
    />
  )
}
