import Link from 'next/link'
import { redirect } from 'next/navigation'
import Shell, { clientLinks, trainerLinks } from '@/components/Shell'
import DeleteAccount from '@/components/DeleteAccount'
import { createClient } from '@/lib/supabase/server'

export default async function Impostazioni() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await sb.from('profiles').select('role, full_name').eq('id', user.id).single()
  const trainer = me?.role === 'trainer'
  return (
    <Shell links={trainer ? trainerLinks : clientLinks}>
      <h1>Impostazioni</h1>
      <section className="card">
        <div className="lr"><span>Nome</span><b>{me?.full_name || '—'}</b></div>
        <div className="lr"><span>Email</span><b>{user.email}</b></div>
        <div className="lr"><span>Tipo di account</span><b>{trainer ? 'Trainer' : 'Cliente'}</b></div>
      </section>
      <section className="card">
        <Link href="/privacy" className="lr" style={{ textDecoration: 'none', color: 'inherit' }}><span>Informativa sulla privacy</span><span className="mu">›</span></Link>
        <Link href="/supporto" className="lr" style={{ textDecoration: 'none', color: 'inherit' }}><span>Supporto</span><span className="mu">›</span></Link>
      </section>
      <h3 style={{ marginTop: 24 }}>Account</h3>
      {trainer ? <p className="mu" style={{ marginTop: 6 }}>L’account del trainer non si elimina da qui. Per chiuderlo scrivi al supporto.</p> : <DeleteAccount />}
    </Shell>
  )
}
