import Link from 'next/link'
import Shell, { trainerLinks } from '@/components/Shell'
import Hero from '@/components/Hero'
import { requireRole } from '@/lib/auth'

export default async function Nutrition() {
  const { sb } = await requireRole('trainer')
  const [cl, ml] = await Promise.all([
    sb.from('profiles').select('id, full_name').eq('role', 'client').order('full_name'),
    sb.from('meals').select('client_id').limit(5000),
  ])
  const has = new Set((ml.data ?? []).map(m => m.client_id))
  return (
    <Shell links={trainerLinks}>
      <Hero k="food" title="Piano alimentare" sub="Scegli un cliente per modificare il suo piano di 7 giorni" />
      {(cl.data ?? []).map(c => (
        <Link key={c.id} href={`/trainer/clients/${c.id}#piano`} className="row" style={{ textDecoration: 'none' }}>
          <span className="av">{(c.full_name || '?')[0]}</span>
          <b style={{ flex: 1 }}>{c.full_name || 'Senza nome'}</b>
          <span className={`chip${has.has(c.id) ? '' : ' w'}`}>{has.has(c.id) ? 'Piano impostato' : 'Nessun piano'}</span>
        </Link>
      ))}
    </Shell>
  )
}
