import Shell, { clientLinks } from '@/components/Shell'
import { requireRole, todayRome } from '@/lib/auth'
import Logger from './Logger'

type WE = { id: string; position: number; sets: number; reps: number; video_url: string | null; exercises: { name: string; video_url: string | null } }

export default async function Oggi() {
  const { sb, user } = await requireRole('client')
  const { data } = await sb
    .from('assignments')
    .select('id, workouts(name, workout_exercises(id, position, sets, reps, video_url, exercises(name, video_url)))')
    .eq('client_id', user.id)
    .eq('scheduled_on', todayRome())
    .maybeSingle()
  const a = data as unknown as { id: string; workouts: { name: string; workout_exercises: WE[] } } | null
  const logs = a ? (await sb.from('set_logs').select('workout_exercise_id, set_no, kg, reps').eq('assignment_id', a.id)).data ?? [] : []
  const list = a ? [...a.workouts.workout_exercises].sort((x, y) => x.position - y.position) : []
  return (
    <Shell links={clientLinks}>
      {a ? (
        <>
          <h1>{a.workouts.name}</h1>
          <p className="mu">Allenamento di oggi · da Coach Raphi</p>
          <Logger assignmentId={a.id} exercises={list.map(e => ({ id: e.id, name: e.exercises.name, sets: e.sets, reps: e.reps, video: e.video_url || e.exercises.video_url }))} logs={logs} />
        </>
      ) : (
        <>
          <h1>Oggi si recupera</h1>
          <p className="mu">Nessun allenamento assegnato per oggi.</p>
        </>
      )}
    </Shell>
  )
}
