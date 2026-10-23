import Link from 'next/link'
import Shell, { trainerLinks } from '@/components/Shell'
import { requireRole } from '@/lib/auth'

export default async function Inbox() {
  const { sb } = await requireRole('trainer')
  const [cl, ms] = await Promise.all([
    sb.from('profiles').select('id, full_name').eq('role', 'client').order('full_name'),
    sb.from('messages').select('client_id, body, sender_id, created_at').order('created_at', { ascending: false }).limit(300),
  ])
  const last = new Map<string, { body: string; sender_id: string }>()
  ;(ms.data ?? []).forEach(m => { if (!last.has(m.client_id)) last.set(m.client_id, m) })
  return (
    <Shell links={trainerLinks}>
      <h1>Messaggi</h1>
      <p className="mu">Parla con i clienti senza uscire dall’app</p>
      {(cl.data ?? []).map(c => {
        const l = last.get(c.id)
        return (
          <Link key={c.id} href={`/trainer/chat/${c.id}`} className="row" style={{ textDecoration: 'none' }}>
            <span className="av">{(c.full_name || '?')[0]}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>{c.full_name || 'Senza nome'}</b>
              <span className="mu" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l ? (l.sender_id === c.id ? '' : 'Tu: ') + l.body : 'Nessun messaggio'}</span>
            </span>
          </Link>
        )
      })}
    </Shell>
  )
}
