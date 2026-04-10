import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function AuthSuccessPage() {
  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pulse
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-slate-200 bg-white px-4 py-8 text-center shadow sm:rounded-lg sm:px-10 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>

          <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">
            Cadastro Confirmado!
          </h3>

          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Obrigado por confirmar seu e-mail e se juntar a nossa plataforma. Sua conta esta pronta para ser usada.
          </p>

          <Link
            href="/dashboard"
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Acessar Plataforma
          </Link>

          <div className="mt-4">
            <Link href="/login" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Ir para a pagina de login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
