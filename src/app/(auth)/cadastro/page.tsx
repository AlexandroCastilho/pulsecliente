"use client"

import { Infinity, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CadastroForm from '@/components/auth/CadastroForm'

export default function CadastroPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-inter">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Página inicial
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-3 transform transition-transform hover:rotate-0">
            <Infinity className="text-white w-8 h-8" />
          </div>
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900 tracking-tight font-inter">
            Opinaloop
          </h2>
          <p className="mt-2 text-center text-base text-gray-500 font-medium max-w-xs mx-auto">
            Crie sua plataforma em segundos e comece a ouvir seus clientes.
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 md:py-10 md:px-8 shadow-2xl shadow-gray-200/60 sm:rounded-3xl border border-gray-100/50 backdrop-blur-sm">
          <CadastroForm />
          
          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Segurança nível empresarial garantida por Opinaloop
            </p>
          </div>
        </div>

        {/* Floating background elements for premium feel */}
        <div className="hidden lg:block absolute top-10 left-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="hidden lg:block absolute bottom-10 right-10 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  )
}
