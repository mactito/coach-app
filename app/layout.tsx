import './globals.css'
import Toast from '@/components/Toast'

export const metadata = { title: 'Coach Raphi' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="app"><main className="phone">{children}<Toast /></main></div>
      </body>
    </html>
  )
}
