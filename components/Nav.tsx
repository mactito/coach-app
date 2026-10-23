'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavLink = { href: string; label: string; icon: string }
const ICO: Record<string, string> = {
  today: 'M4 6h16v14H4zM4 10h16M9 15l2 2 4-4', prog: 'M4 19V5M4 19h16M8 15l4-4 3 3 5-6',
  food: 'M7 3v7a2 2 0 0 0 2 2v9M11 3v7M5 3v5M17 3c-2 2-3 7 0 9v9',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M18 15c2 .5 3 2.5 3 5',
  build: 'M4 7h16M4 12h16M4 17h9M18 15v6M15 18h6', cam: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  chat: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
}

export default function Nav({ links }: { links: NavLink[] }) {
  const p = usePathname()
  const on = (h: string) => (h === '/trainer' ? p === '/trainer' || p.startsWith('/trainer/clients') : p.startsWith(h))
  return (
    <nav>
      {links.map(l => (
        <Link key={l.href} href={l.href} className={on(l.href) ? 'on' : ''}>
          <svg className="i" viewBox="0 0 24 24"><path d={ICO[l.icon]} /></svg>{l.label}
        </Link>
      ))}
    </nav>
  )
}
