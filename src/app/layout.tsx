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
   title: "Opinaloop - Plataforma de Pesquisas",
   description: "Entenda seus clientes de verdade com o Opinaloop. Colete feedbacks, meça o NPS e tome decisões baseadas em dados reais.",
   robots: "index, follow",
   openGraph: {
     title: "Opinaloop - Plataforma de Pesquisas",
     description: "Colete feedbacks, meça o NPS e tome decisões baseadas em dados reais.",
     url: "https://opinaloop.com",
     siteName: "Opinaloop",
     images: [
       {
         url: "/og-image.jpg",
         width: 1200,
         height: 630,
         alt: "Opinaloop - Plataforma de Customer Experience",
       },
     ],
     type: "website",
     locale: "pt_BR",
   },
   twitter: {
     card: "summary_large_image",
     title: "Opinaloop - Plataforma de Pesquisas",
     description: "Colete feedbacks, meça o NPS e tome decisões baseadas em dados reais.",
     images: ["/og-image.jpg"],
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
