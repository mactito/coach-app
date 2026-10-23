import Link from 'next/link'
import Shell, { clientLinks } from '@/components/Shell'
import Hero from '@/components/Hero'
import WorkoutPreview, { type WE } from '@/components/WorkoutPreview'
import { requireRole } from '@/lib/auth'
import { todayRome, weekDates, weekdayName } from '@/lib/dates'
import { DAYS } from '@/lib/nutrition'
import Logger from './Logger'

type A = { id: string; scheduled_on: string; workouts: { name: string; workout_exercises: WE[] } }

export default async function Oggi({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  const { sb, user } = await requireRole('client')
  const week = weekDates(), today = todayRome()
  const g = (await searchParams).g
  const sel = g && week.includes(g) ? g : today
  const { data } = await sb.from('assignments')
    .select('id, scheduled_on, workouts(name, workout_exercises(id, position, sets, reps, video_url, exercises(name, video_url)))')
    .eq('client_id', user.id).in('scheduled_on', week)
  const all = (data ?? []) as unknown as A[]
  const a = all.find(x => x.scheduled_on === sel)
  const logs = a ? (await sb.from('set_logs').select('workout_exercise_id, set_no, kg, reps').eq('assignment_id', a.id)).data ?? [] : []
  const list = a ? [...a.workouts.workout_exercises].sort((x, y) => x.position - y.position) : []
  return (
    <Shell links={clientLinks}>
      <div className="dys" style={{ margin: '0 0 12px' }}>
        {week.map((d, i) => (
          <Link key={d} href={`/oggi?g=${d}`} className={`${d === sel ? 'on' : ''}${all.some(x => x.scheduled_on === d) ? ' hs' : ''}${d === today ? ' tdy' : ''}`} aria-label={weekdayName(d)}>{DAYS[i]}</Link>
        ))}
      </div>
      {!a ? <Hero k="workout" title="Giorno di recupero" sub={`${weekdayName(sel)} · nessun allenamento assegnato`} /> : (
        <>
          <Hero k="workout" title={a.workouts.name} sub={`${weekdayName(sel)} · da Coach Raphi`} />
          {sel === today
            ? <Logger assignmentId={a.id} clientId={user.id} workoutName={a.workouts.name} exercises={list.map(e => ({ id: e.id, name: e.exercises.name, sets: e.sets, reps: e.reps, video: e.video_url || e.exercises.video_url }))} logs={logs} />
            : <>
                <p className="mu" style={{ marginTop: 12 }}>{sel < today ? (logs.length > 0 ? 'Allenamento completato.' : 'Giorno passato.') : 'Potrai registrare le serie il giorno stesso.'}</p>
                <WorkoutPreview list={list} />
              </>}
        </>
      )}
    </Shell>
  )
}
