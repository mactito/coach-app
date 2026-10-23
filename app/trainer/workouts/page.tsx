import Shell, { trainerLinks } from '@/components/Shell'
import { requireRole } from '@/lib/auth'
import WorkoutsClient from './WorkoutsClient'

export default async function Workouts() {
  const { sb } = await requireRole('trainer')
  const [ex, cl, wo] = await Promise.all([
    sb.from('exercises').select('id, name, muscle').order('name'),
    sb.from('profiles').select('id, full_name').eq('role', 'client').order('full_name'),
    sb.from('workouts').select('id, name, workout_exercises(count)').order('created_at', { ascending: false }),
  ])
  return (
    <Shell links={trainerLinks}>
      <h1>Allenamenti</h1>
      <p className="mu">Crea un allenamento una volta, assegnalo a quanti clienti vuoi.</p>
      <WorkoutsClient exercises={ex.data ?? []} clients={cl.data ?? []} workouts={wo.data ?? []} />
    </Shell>
  )
}
