import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CookieNotice from '@/components/CookieNotice'
import Analytics from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Arena Política — Vote, jogue e veja o Brasil em tempo real',
  description: 'Duelo ao vivo, quiz e mapa de dominância regional. Dê seu voto e compartilhe nos Stories.',
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
}

export const viewport: Viewport = { themeColor: '#05060f', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} arena-bg min-h-screen antialiased`}>
        {children}
        <CookieNotice />
        <Analytics />
      </body>
    </html>
  )
}
