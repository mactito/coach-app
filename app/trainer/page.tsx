import Link from 'next/link'
import Shell, { trainerLinks } from '@/components/Shell'
import Hero from '@/components/Hero'
import { requireRole } from '@/lib/auth'
import { todayRome, weekDates, weekdayName } from '@/lib/dates'
import { DAYS } from '@/lib/nutrition'
import { loadSessions, statusOf } from '@/lib/sessions'

const when = (s: string) => new Date(s).toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

export default async function Dashboard() {
  const { sb } = await requireRole('trainer')
  const today = todayRome(), wk = weekDates()
  const { data } = await sb.from('profiles').select('id, full_name').eq('role', 'client').order('full_name')
  const cl = data ?? []
  const name = new Map(cl.map(c => [c.id, c.full_name || 'Senza nome']))
  const [map, fb, lastMsg] = await Promise.all([
    loadSessions(sb, cl.map(c => c.id), 14),
    sb.from('messages').select('id, client_id, body, created_at').ilike('body', 'Dopo l%').order('created_at', { ascending: false }).limit(4),
    sb.from('messages').select('client_id, sender_id, created_at').order('created_at', { ascending: false }).limit(300),
  ])
  const sessions = cl.flatMap(c => (map.get(c.id) ?? []).map(s => ({ ...s, client: c.id })))
  const todays = sessions.filter(s => s.date === today)
  const needs = cl.filter(c => !statusOf(map.get(c.id) ?? []).ok)
  const seen = new Set<string>(), waiting: string[] = []
  ;(lastMsg.data ?? []).forEach(m => { if (seen.has(m.client_id)) return; seen.add(m.client_id); if (m.sender_id === m.client_id) waiting.push(m.client_id) })
  const planned = wk.map(d => sessions.filter(s => s.date === d).length)
  const done = wk.map(d => sessions.filter(s => s.date === d && s.done > 0).length)
  const max = Math.max(1, ...planned)

  return (
    <Shell links={trainerLinks}>
      <Hero k="coach" title="Ciao, Coach Raphi" sub={weekdayName(today)} />
      <div className="st">
        <div><b>{cl.length}</b><span className="mu">clienti</span></div>
        <div><b>{todays.filter(s => s.done > 0).length}/{todays.length}</b><span className="mu">oggi</span></div>
        <div><b style={waiting.length ? { color: 'var(--wn)' } : undefined}>{waiting.length}</b><span className="mu">da risponder</span></div>
      </div>

      <section className="card">
        <h3>Oggi</h3>
        {todays.length === 0 && <p className="mu" style={{ marginTop: 6 }}>Nessun allenamento previsto oggi.</p>}
        {todays.map(s => (
          <Link key={s.id} href={`/trainer/clients/${s.client}`} className="lr" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span><b>{name.get(s.client)}</b><br /><span className="mu">{s.name}</span></span>
            <span className={`chip${s.done === 0 ? ' w' : ''}`}>{s.done === 0 ? 'Da fare' : s.done >= s.total ? 'Fatto' : `${s.done}/${s.total}`}</span>
          </Link>
        ))}
      </section>

      <section className="card">
        <h3>Da seguire</h3>
        {needs.length === 0 && <p className="mu" style={{ marginTop: 6 }}>Tutti i clienti sono in regola.</p>}
        {needs.map(c => (
          <Link key={c.id} href={`/trainer/clients/${c.id}`} className="lr" style={{ textDecoration: 'none', color: 'inherit' }}>
            <b>{c.full_name || 'Senza nome'}</b><span className="chip w">Ha saltato sedute</span>
          </Link>
        ))}
        {waiting.map(id => (
          <Link key={id} href={`/trainer/chat/${id}`} className="lr" style={{ textDecoration: 'none', color: 'inherit' }}>
            <b>{name.get(id)}</b><span className="chip w">Messaggio da leggere</span>
          </Link>
        ))}
      </section>

      <section className="card">
        <h3>Questa settimana</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginTop: 14, alignItems: 'end' }}>
          {wk.map((d, i) => (
            <div key={d} style={{ textAlign: 'center' }}>
              <div style={{ height: 64, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: `${(planned[i] / max) * 100}%`, minHeight: planned[i] ? 8 : 0, background: 'var(--acs)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${planned[i] ? (done[i] / planned[i]) * 100 : 0}%`, background: 'var(--ok)' }} />
                </div>
              </div>
              <span className="mu" style={d === today ? { color: 'var(--ac)', fontWeight: 700 } : undefined}>{DAYS[i]}</span>
            </div>
          ))}
        </div>
        <p className="mu" style={{ marginTop: 10 }}>Sedute svolte (verde) sul totale previsto.</p>
      </section>

      {(fb.data ?? []).length > 0 && (
        <section className="card">
          <h3>Ultimi commenti dopo l’allenamento</h3>
          {(fb.data ?? []).map(m => (
            <Link key={m.id} href={`/trainer/chat/${m.client_id}`} className="lr" style={{ textDecoration: 'none', color: 'inherit', flexDirection: 'column', gap: 2 }}>
              <span><b>{name.get(m.client_id)}</b> <span className="mu">· {when(m.created_at)}</span></span>
              <span className="mu">{m.body.replace('Dopo l’allenamento · ', '')}</span>
            </Link>
          ))}
        </section>
      )}
    </Shell>
  )
}
