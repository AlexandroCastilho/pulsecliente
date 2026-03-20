import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pulse7-0.vercel.app"), // URL final de produção
  title: {
    default: "Opinaloop - Plataforma de Pesquisas de Satisfação e NPS",
    template: "%s | Opinaloop"
  },
  description: "Entenda os seus clientes de verdade com pesquisas de satisfação e NPS inteligentes. Crie, dispare e analise em minutos.",
  keywords: ["NPS", "Pesquisa de Satisfação", "Feedback de Cliente", "Customer Experience", "Opinaloop"],
  robots: "index, follow",
  openGraph: {
    title: "Opinaloop - Plataforma de Pesquisas de Satisfação",
    description: "Entenda os seus clientes de verdade com pesquisas de satisfação e NPS inteligentes. Crie, dispare e analise em minutos.",
    url: "https://pulse7-0.vercel.app",
    siteName: "Opinaloop",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Opinaloop - Dashboards e NPS",
      },
    ],
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opinaloop - NPS Inteligente",
    description: "Capture feedbacks valiosos com facilidade.",
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
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased font-sans">
        <ToasterProvider />
        {children}
      </body>
    </html>
  )
}
