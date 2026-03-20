import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

  export const metadata: Metadata = {
    title: "Opinaloop - Plataforma de Pesquisas de Satisfação",
    description: "Entenda os seus clientes de verdade com pesquisas de satisfação e NPS inteligentes. Crie, dispare e analise em minutos.",
    robots: "index, follow",
    openGraph: {
      title: "Opinaloop - Plataforma de Pesquisas de Satisfação",
      description: "Entenda os seus clientes de verdade com pesquisas de satisfação e NPS inteligentes. Crie, dispare e analise em minutos.",
      url: "https://pulsecliente.vercel.app", // Alinhado com a migração Vercel
      siteName: "Opinaloop",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Opinaloop - Plataforma de Pesquisas de Satisfação",
        },
      ],
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: "Opinaloop - Plataforma de Pesquisas de Satisfação",
      description: "Entenda os seus clientes de verdade com pesquisas de satisfação e NPS inteligentes. Crie, dispare e analise em minutos.",
      images: ["/og-image.png"],
    },
  };

import { ToasterProvider } from '@/components/ToastProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <ToasterProvider />
        {children}
      </body>
    </html>
  )
}
