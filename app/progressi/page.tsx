import Shell, { clientLinks } from '@/components/Shell'
import ProgressView from '@/components/ProgressView'
import { requireRole } from '@/lib/auth'
import { loadLift, loadSessions } from '@/lib/sessions'

export default async function Progressi() {
  const { sb, user } = await requireRole('client')
  const [m, lift] = await Promise.all([loadSessions(sb, [user.id]), loadLift(sb, user.id)])
  return (
    <Shell links={clientLinks}>
      <h1>I tuoi progressi</h1>
      <p className="mu">Gli ultimi due mesi</p>
      <ProgressView sessions={m.get(user.id) ?? []} lift={lift} />
    </Shell>
  )
}
