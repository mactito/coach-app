import ClientGrid from '@/components/ClientGrid'
import { requireRole } from '@/lib/auth'
import { fmtDay } from '@/lib/dates'
import { loadSessions, statusOf, weekDots } from '@/lib/sessions'

export default async function Clients() {
  const { sb } = await requireRole('trainer')
  const [{ data }, map] = await Promise.all([
    sb.from('profiles').select('id, full_name').eq('role', 'client').order('full_name'),
    loadSessions(sb, null, 14),
  ])
  const cl = data ?? []
  const rows = cl.map(c => {
    const ss = map.get(c.id) ?? [], last = ss.filter(s => s.done > 0).pop()
    return { id: c.id, name: c.full_name || 'Senza nome', ok: statusOf(ss).ok, dots: weekDots(ss), sub: last ? `Ultimo: ${fmtDay(last.date)}` : 'Nessun allenamento ancora' }
  })
  return (
    <>
      <h1>Clienti</h1>
      <p className="mu">{rows.length} clienti registrati</p>
      {rows.length === 0 ? <p className="mu" style={{ marginTop: 14 }}>Nessun cliente ancora. I clienti si registrano dalla pagina di accesso.</p> : <ClientGrid rows={rows} />}
    </>
  )
}
