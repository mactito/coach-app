import Link from 'next/link'
import { notFound } from 'next/navigation'
import AssignClient from '@/components/AssignClient'
import NutritionEditor from '@/components/NutritionEditor'
import PhotoPair from '@/components/PhotoPair'
import PlanEditor from '@/components/PlanEditor'
import ProgressView from '@/components/ProgressView'
import SessionView, { type SEx } from '@/components/SessionView'
import { requireRole } from '@/lib/auth'
import { addDays, fmtDay, fmtShort, todayRome, weekDates, weekdayName } from '@/lib/dates'
import { DAYS, DEFAULT_TARGET, type Meal } from '@/lib/nutrition'
import { latestPhotos, loadLift, loadSessions } from '@/lib/sessions'

type WE = SEx & { exercise_id: string; position: number; rest_seconds: number; video_url: string | null }
type A = { id: string; scheduled_on: string; set_logs: { workout_exercise_id: string; set_no: number; kg: number | null; reps: number | null }[]; workouts: { id: string; name: string; is_custom: boolean; workout_exercises: WE[] } }

export default async function ClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ g?: string }> }) {
  const { id } = await params
  const g = (await searchParams).g
  const { sb } = await requireRole('trainer')
  const today = todayRome()
  const sel = g && /^\d{4}-\d{2}-\d{2}$/.test(g) ? g : today
  const week = weekDates(sel)
  const [p, t, m, ses, lift, photos, wo, ex, asg, cp] = await Promise.all([
    sb.from('profiles').select('full_name').eq('id', id).eq('role', 'client').single(),
    sb.from('nutrition_targets').select('kcal, protein, carbs, fat').eq('client_id', id).maybeSingle(),
    sb.from('meals').select('*').eq('client_id', id).order('position'),
    loadSessions(sb, [id]), loadLift(sb, id), latestPhotos(sb, id),
    sb.from('workouts').select('id, name').is('deleted_at', null).eq('is_custom', false).order('created_at', { ascending: false }),
    sb.from('exercises').select('id, name, muscle, video_url').order('name'),
    sb.from('assignments').select('id, scheduled_on, workouts(id, name, is_custom, workout_exercises(id, exercise_id, position, sets, reps, rest_seconds, video_url, exercises(name))), set_logs(workout_exercise_id, set_no, kg, reps)').eq('client_id', id).in('scheduled_on', week),
    sb.from('client_profiles').select('age, weight_kg, height_cm, goal, experience, days_per_week, limitations').eq('client_id', id).maybeSingle(),
  ])
  if (!p.data) notFound()
  const name = p.data.full_name || 'Senza nome', first = name.split(' ')[0]
  const sessions = ses.get(id) ?? []
  const byDate = new Map(sessions.map(s => [s.date, s]))
  const all = (asg.data ?? []) as unknown as A[]
  const a = all.find(x => x.scheduled_on === sel)
  const logs = a?.set_logs ?? []
  const list = a ? [...a.workouts.workout_exercises].sort((x, y) => x.position - y.position) : []
  const editable = !!a && sel >= today && logs.length === 0
  const last = sessions.filter(s => s.done > 0).pop()
  const dayLabel = `${weekdayName(sel)} ${fmtShort(sel)}`
  const base = `/trainer/clients/${id}`
  const cls = (d: string) => {
    const s = byDate.get(d)
    return `${d === sel ? 'on' : ''}${all.some(x => x.scheduled_on === d) ? ' hs' : ''}${d === today ? ' tdy' : ''}${s ? (s.done > 0 ? ' dn' : d < today ? ' ms' : '') : ''}`
  }

  return (
    <>
      <Link className="back" href="/trainer/clients">‹ Clienti</Link>
      <h1>{name}</h1>

      <section className="card">
        <div className="eh">
          <Link className="back" style={{ padding: 0 }} href={`${base}?g=${addDays(sel, -7)}`} aria-label="Settimana precedente">‹</Link>
          <h3>{fmtShort(week[0])} – {fmtShort(week[6])}</h3>
          <Link className="back" style={{ padding: 0 }} href={`${base}?g=${addDays(sel, 7)}`} aria-label="Settimana successiva">›</Link>
        </div>
        <div className="dys">
          {week.map((d, i) => <Link key={d} href={`${base}?g=${d}`} className={cls(d)} aria-label={weekdayName(d)}>{DAYS[i]}</Link>)}
        </div>

        <h3 style={{ marginTop: 16 }}>{dayLabel}{sel === today ? ' · oggi' : ''}</h3>
        {!a && (
          <>
            <p className="mu" style={{ marginTop: 6 }}>Nessun allenamento assegnato per questo giorno.</p>
            {sel >= today && <AssignClient clientId={id} clientName={first} workouts={wo.data ?? []} date={sel} label="Assegna allenamento a questo giorno" />}
          </>
        )}
        {a && editable && (
          <>
            <PlanEditor key={a.id + a.workouts.id} assignmentId={a.id} workout={{ id: a.workouts.id, name: a.workouts.name, is_custom: a.workouts.is_custom }}
              initial={list.map(e => ({ id: e.id, exercise_id: e.exercise_id, name: e.exercises.name, sets: e.sets, reps: e.reps, rest_seconds: e.rest_seconds, video_url: e.video_url }))}
              library={ex.data ?? []} clientName={first} dayLabel={dayLabel} />
            <AssignClient clientId={id} clientName={first} workouts={wo.data ?? []} date={sel} label="Cambia allenamento" />
          </>
        )}
        {a && !editable && (
          <>
            <div className="eh" style={{ marginTop: 6 }}>
              <b>{a.workouts.name}</b>
              <span className={`chip${logs.length === 0 ? ' w' : ''}`}>{logs.length === 0 ? 'Saltato' : sel < today ? 'Svolto' : 'In corso'}</span>
            </div>
            <p className="mu" style={{ marginTop: 4 }}>{logs.length === 0 ? 'Il cliente non ha registrato serie in questo giorno.' : 'Il cliente ha già registrato delle serie: questo allenamento non si può più modificare.'}</p>
            <SessionView list={list} logs={logs} />
          </>
        )}
      </section>

      <div className="g2" style={{ marginTop: 6 }}>
        <AssignClient clientId={id} clientName={first} workouts={wo.data ?? []} />
        <Link className="btn s" href={`/trainer/chat/${id}`}>Scrivi a {first}</Link>
      </div>

      <details className="fold"><summary>Profilo</summary><div>
        {!cp.data ? <p className="mu">Il cliente non ha ancora compilato il questionario.</p> : (
          <>
            <div className="lr"><span>Età</span><b>{cp.data.age} anni</b></div>
            <div className="lr"><span>Peso</span><b>{String(cp.data.weight_kg).replace('.', ',')} kg</b></div>
            <div className="lr"><span>Altezza</span><b>{cp.data.height_cm} cm</b></div>
            <div className="lr"><span>Obiettivo</span><b>{cp.data.goal}</b></div>
            <div className="lr"><span>Livello</span><b>{cp.data.experience}</b></div>
            <div className="lr"><span>Giorni a settimana</span><b>{cp.data.days_per_week}</b></div>
            <div className="lr" style={{ flexDirection: 'column', gap: 2 }}><span>Infortuni o limitazioni</span><b>{cp.data.limitations || 'Nessuna indicata'}</b></div>
          </>
        )}
      </div></details>
      <details className="fold"><summary>Progressi</summary><div>
        <p className="mu">{last ? `Ultimo allenamento: ${fmtDay(last.date)} · ${last.name} · ${last.done}/${last.total} serie` : 'Nessun allenamento registrato ancora.'}</p>
        <ProgressView sessions={sessions} lift={lift} />
      </div></details>
      <details className="fold"><summary>Foto check-in</summary><div><PhotoPair photos={photos} name={first} /></div></details>
      <details className="fold"><summary>Piano alimentare</summary><div>
        <NutritionEditor clientId={id} clientName={first} initialMeals={(m.data ?? []) as Meal[]} initialTarget={t.data ?? DEFAULT_TARGET} />
      </div></details>
    </>
  )
}
