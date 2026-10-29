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

export { trainerLinks, clientLinks } from '@/lib/links'
