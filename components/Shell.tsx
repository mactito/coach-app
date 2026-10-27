import Link from 'next/link'
import Nav, { type NavLink } from '@/components/Nav'
import LogoutButton from '@/components/LogoutButton'

export default function Shell({ links, children, chat }: { links: NavLink[]; children: React.ReactNode; chat?: boolean }) {
  return (
    <>
      <div className={chat ? 'scr ch' : 'scr'}>
        <div className="eh">
          <LogoutButton />
          <Link className="back" href="/impostazioni">Impostazioni</Link>
        </div>
        {children}
      </div>
      <Nav links={links} />
    </>
  )
}

export const trainerLinks: NavLink[] = [
  { href: '/trainer', label: 'Home', icon: 'home' },
  { href: '/trainer/clients', label: 'Clienti', icon: 'users' },
  { href: '/trainer/workouts', label: 'Allenamenti', icon: 'build' },
  { href: '/trainer/chat', label: 'Messaggi', icon: 'chat' },
]
export const clientLinks: NavLink[] = [
  { href: '/oggi', label: 'Oggi', icon: 'today' },
  { href: '/progressi', label: 'Progressi', icon: 'prog' },
  { href: '/chat', label: 'Chat', icon: 'chat' },
  { href: '/alimentazione', label: 'Piano', icon: 'food' },
]
