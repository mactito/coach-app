import Shell, { trainerLinks } from '@/components/Shell'
import { requireRole } from '@/lib/auth'
import WorkoutsClient from './WorkoutsClient'

export default async function Workouts() {
  const { sb } = await requireRole('trainer')
  const [ex, cl, wo, used] = await Promise.all([
    sb.from('exercises').select('id, name, muscle, video_url').order('name'),
    sb.from('profiles').select('id, full_name').eq('role', 'client').order('full_name'),
    sb.from('workouts').select('id, name, workout_exercises(id, exercise_id, sets, reps, video_url, position)').is('deleted_at', null).eq('is_custom', false).order('created_at', { ascending: false }),
    sb.from('workouts_used').select('workout_id'),
  ])
  return (
    <Shell links={trainerLinks}>
      <h1>Allenamenti</h1>
      <p className="mu">Crea un allenamento una volta, assegnalo a chi vuoi.</p>
      <WorkoutsClient exercises={ex.data ?? []} clients={cl.data ?? []} workouts={wo.data ?? []} usedIds={(used.data ?? []).map(u => u.workout_id as string)} />
    </Shell>
  )
}
