import './globals.css'
import type { Metadata, Viewport } from 'next'
import NativeInit from '@/components/NativeInit'
import PushInit from '@/components/PushInit'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Coach Raphi',
  description: 'Allenamenti, pasti e progressi in un unico posto.',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'Coach Raphi', statusBarStyle: 'default' },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#3B4CCA' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="app"><main className="phone">{children}<Toast /></main>
        <NativeInit />
        <PushInit /></div>
      </body>
    </html>
  )
}
