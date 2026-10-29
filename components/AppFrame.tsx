'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import Nav, { type NavLink } from '@/components/Nav'

// Stays on screen while pages load, so tapping a tab feels instant.
export default function AppFrame({ links, children }: { links: NavLink[]; children: React.ReactNode }) {
  const p = usePathname()
  const chat = p === '/chat' || /^\/trainer\/chat\/[^/]+/.test(p)
  return (
    <>
      <div className={chat ? 'scr ch' : 'scr'}>
        <div className="eh"><LogoutButton /><Link className="back" href="/impostazioni">Impostazioni</Link></div>
        {children}
      </div>
      <Nav links={links} />
    </>
  )
}
