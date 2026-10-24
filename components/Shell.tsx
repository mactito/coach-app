import Nav, { type NavLink } from '@/components/Nav'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function logout() {
  'use server'
  const sb = await createClient()
  await sb.auth.signOut()
  redirect('/login')
}

export default function Shell({ links, children, chat }: { links: NavLink[]; children: React.ReactNode; chat?: boolean }) {
  return (
    <>
      <div className={chat ? 'scr ch' : 'scr'}>
        <form action={logout}><button className="back" type="submit">Esci</button></form>
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
