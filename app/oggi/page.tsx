import Link from 'next/link'
import Shell, { clientLinks } from '@/components/Shell'
import Hero from '@/components/Hero'
import WorkoutPreview, { type WE } from '@/components/WorkoutPreview'
import { requireRole } from '@/lib/auth'
import { addDays, fmtShort, todayRome, weekDates, weekdayName } from '@/lib/dates'
import { DAYS } from '@/lib/nutrition'
import Logger from './Logger'

type A = { id: string; scheduled_on: string; workouts: { name: string; workout_exercises: WE[] } }

export default async function Oggi({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  const { sb, user } = await requireRole('client')
  const today = todayRome()
  const g = (await searchParams).g
  const sel = g && /^\d{4}-\d{2}-\d{2}$/.test(g) ? g : today
  const week = weekDates(sel)
  const { data } = await sb.from('assignments')
    .select('id, scheduled_on, workouts(name, workout_exercises(id, exercise_id, position, sets, reps, video_url, exercises(name, video_url)))')
    .eq('client_id', user.id).in('scheduled_on', week)
  const all = (data ?? []) as unknown as A[]
  const a = all.find(x => x.scheduled_on === sel)
  const logs = a ? (await sb.from('set_logs').select('workout_exercise_id, set_no, kg, reps').eq('assignment_id', a.id)).data ?? [] : []
  const list = a ? [...a.workouts.workout_exercises].sort((x, y) => x.position - y.position) : []

  // "Ultima volta": the same exercise in the client's most recent earlier session
  const prev: Record<string, string> = {}
  const exIds = Array.from(new Set(list.map(e => e.exercise_id)))
  if (a && sel === today && exIds.length) {
    const { data: ph } = await sb.from('set_logs')
      .select('set_no, kg, reps, assignments!inner(client_id, scheduled_on), workout_exercises!inner(exercise_id)')
      .eq('assignments.client_id', user.id).lt('assignments.scheduled_on', today).in('workout_exercises.exercise_id', exIds).limit(800)
    const rows = (ph ?? []) as any[]
    const latest = new Map<string, string>()
    rows.forEach(r => { const e = r.workout_exercises?.exercise_id, d = r.assignments?.scheduled_on; if (e && d && (latest.get(e) ?? '') < d) latest.set(e, d) })
    list.forEach(we => rows.filter(r => r.workout_exercises?.exercise_id === we.exercise_id && r.assignments?.scheduled_on === latest.get(we.exercise_id))
      .forEach(r => { prev[`${we.id}:${r.set_no}`] = `${r.kg ?? '—'} × ${r.reps ?? '—'}` }))
  }

  return (
    <Shell links={clientLinks}>
      <div className="eh" style={{ margin: '0 0 8px' }}>
        <Link className="back" style={{ padding: 0 }} href={`/oggi?g=${addDays(sel, -7)}`} aria-label="Settimana precedente">‹</Link>
        <span className="mu">{fmtShort(week[0])} – {fmtShort(week[6])}</span>
        <Link className="back" style={{ padding: 0 }} href={`/oggi?g=${addDays(sel, 7)}`} aria-label="Settimana successiva">›</Link>
      </div>
      <div className="dys" style={{ margin: '0 0 12px' }}>
        {week.map((d, i) => (
          <Link key={d} href={`/oggi?g=${d}`} className={`${d === sel ? 'on' : ''}${all.some(x => x.scheduled_on === d) ? ' hs' : ''}${d === today ? ' tdy' : ''}`} aria-label={weekdayName(d)}>{DAYS[i]}</Link>
        ))}
      </div>
      {!a ? <Hero k="workout" title="Giorno di recupero" sub={`${weekdayName(sel)} · nessun allenamento assegnato`} /> : (
        <>
          <Hero k="workout" title={a.workouts.name} sub={`${weekdayName(sel)} · da Coach Raphi`} />
          {sel === today
            ? <Logger assignmentId={a.id} clientId={user.id} workoutName={a.workouts.name} prev={prev} exercises={list.map(e => ({ id: e.id, name: e.exercises.name, sets: e.sets, reps: e.reps, video: e.video_url || e.exercises.video_url }))} logs={logs} />
            : <>
                <p className="mu" style={{ marginTop: 12 }}>{sel < today ? (logs.length > 0 ? 'Allenamento completato.' : 'Giorno passato.') : 'Potrai registrare le serie il giorno stesso.'}</p>
                <WorkoutPreview list={list} />
              </>}
        </>
      )}
    </Shell>
  )
}
