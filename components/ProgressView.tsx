import Chart from '@/components/Chart'
import { fmtDay, todayRome, weekDates } from '@/lib/dates'
import type { Session } from '@/lib/sessions'

export default function ProgressView({ sessions, lift }: { sessions: Session[]; lift: { lift: string; points: number[] } | null }) {
  const today = todayRome(), wk = weekDates(), from28 = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10)
  const week = sessions.filter(s => wk.includes(s.date))
  const past = sessions.filter(s => s.date >= from28 && (s.date < today || s.done > 0))
  const pct = past.length ? Math.round((past.filter(s => s.done > 0).length / past.length) * 100) : null
  const gain = lift ? lift.points[lift.points.length - 1] - lift.points[0] : 0
  const recent = sessions.filter(s => s.date <= today).slice(-5).reverse()
  return (
    <>
      <div className="st">
        <div><b>{pct === null ? '—' : `${pct}%`}</b><span className="mu">costanza</span></div>
        <div><b>{week.filter(s => s.done > 0).length} su {week.length}</b><span className="mu">questa settimana</span></div>
        <div><b>{gain > 0 ? '+' : ''}{String(gain).replace('.', ',')}</b><span className="mu">kg{lift ? ` · ${lift.lift}` : ''}</span></div>
      </div>
      <section className="card">
        <h3>{lift ? lift.lift : 'Peso sollevato'}</h3>
        <p className="mu">Serie migliore di ogni allenamento, in kg</p>
        <Chart points={lift?.points ?? []} label={lift?.lift ?? 'Peso'} />
      </section>
      <section className="card">
        <h3>Sedute recenti</h3>
        {recent.length === 0 && <p className="mu" style={{ marginTop: 4 }}>Nessun allenamento ancora.</p>}
        {recent.map(s => (
          <div key={s.id} className="lr"><span>{fmtDay(s.date)} · {s.name}</span><span className={`chip${s.done === 0 ? ' w' : ''}`}>{s.done === 0 ? 'Saltato' : `${s.done}/${s.total} serie`}</span></div>
        ))}
      </section>
    </>
  )
}
