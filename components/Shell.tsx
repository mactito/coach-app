import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function logout() {
  'use server'
  const sb = await createClient()
  await sb.auth.signOut()
  redirect('/login')
}

export default function Shell({ links, children, chat }: { links: { href: string; label: string }[]; children: React.ReactNode; chat?: boolean }) {
  return (
    <>
      <div className={chat ? 'scr ch' : 'scr'}>
        <form action={logout}><button className="back" type="submit">Esci</button></form>
        {children}
      </div>
      <nav>{links.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
    </>
  )
}

export const trainerLinks = [{ href: '/trainer', label: 'Clienti' }, { href: '/trainer/workouts', label: 'Allenamenti' }, { href: '/trainer/chat', label: 'Messaggi' }]
export const clientLinks = [{ href: '/oggi', label: 'Oggi' }, { href: '/alimentazione', label: 'Alimentazione' }, { href: '/chat', label: 'Chat' }]
