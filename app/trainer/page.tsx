import Link from 'next/link'
import Shell, { trainerLinks } from '@/components/Shell'
import { requireRole } from '@/lib/auth'

type Row = { id: string; full_name: string | null; assignments: { count: number }[] }
const GR = ['#3B4CCA,#7A4FD6', '#C2410C,#7A4FD6', '#0E9F77,#2B3A8F', '#2B3A8F,#1B2433']

export default async function Trainer() {
  const { sb } = await requireRole('trainer')
  const { data } = await sb.from('profiles').select('id, full_name, assignments(count)').eq('role', 'client').order('full_name')
  const clients = (data ?? []) as Row[]
  return (
    <Shell links={trainerLinks}>
      <h1>Clienti</h1>
      <p className="mu">{clients.length} clienti registrati</p>
      {clients.length === 0 && <p className="mu" style={{ marginTop: 14 }}>Nessun cliente ancora. I clienti si registrano dalla pagina di accesso.</p>}
      <div className="cg">
        {clients.map((c, i) => (
          <Link key={c.id} href={`/trainer/clients/${c.id}`} className="cc" style={{ backgroundImage: `linear-gradient(135deg,${GR[i % GR.length]})` }}>
            <span className="ini">{(c.full_name || '?')[0]}</span>
            <span className="in"><b>{c.full_name || 'Senza nome'}</b><span className="sm">{c.assignments?.[0]?.count ?? 0} allenamenti assegnati</span></span>
          </Link>
        ))}
      </div>
    </Shell>
  )
}
