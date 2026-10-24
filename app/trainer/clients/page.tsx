import Shell, { trainerLinks } from '@/components/Shell'
import ClientGrid from '@/components/ClientGrid'
import { requireRole } from '@/lib/auth'
import { fmtDay } from '@/lib/dates'
import { loadSessions, statusOf, weekDots } from '@/lib/sessions'

export default async function Clients() {
  const { sb } = await requireRole('trainer')
  const { data } = await sb.from('profiles').select('id, full_name').eq('role', 'client').order('full_name')
  const cl = data ?? []
  const map = await loadSessions(sb, cl.map(c => c.id), 14)
  const rows = cl.map(c => {
    const ss = map.get(c.id) ?? [], last = ss.filter(s => s.done > 0).pop()
    return { id: c.id, name: c.full_name || 'Senza nome', ok: statusOf(ss).ok, dots: weekDots(ss), sub: last ? `Ultimo: ${fmtDay(last.date)}` : 'Nessun allenamento ancora' }
  })
  return (
    <Shell links={trainerLinks}>
      <h1>Clienti</h1>
      <p className="mu">{rows.length} clienti registrati</p>
      {rows.length === 0 ? <p className="mu" style={{ marginTop: 14 }}>Nessun cliente ancora. I clienti si registrano dalla pagina di accesso.</p> : <ClientGrid rows={rows} />}
    </Shell>
  )
}
