import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; // Se existir, caso contrário o botão padrão

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        {/* Espaço para o ThemeToggle se houver, ou outro header */}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pulse
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-800 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Cadastro Confirmado!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Obrigado por confirmar seu e-mail e se juntar à nossa plataforma. Sua conta está pronta para ser usada.
          </p>

          <Link
            href="/dashboard"
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            Acessar Plataforma
          </Link>
          
          <div className="mt-4">
            <Link href="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Ir para a página de Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
