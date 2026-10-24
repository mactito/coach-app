import Shell, { clientLinks } from '@/components/Shell'
import PhotoSlot from '@/components/PhotoSlot'
import ProgressView from '@/components/ProgressView'
import { requireRole } from '@/lib/auth'
import { latestPhotos, loadLift, loadSessions } from '@/lib/sessions'

export default async function Progressi() {
  const { sb, user } = await requireRole('client')
  const [m, lift, p] = await Promise.all([loadSessions(sb, [user.id]), loadLift(sb, user.id), latestPhotos(sb, user.id)])
  return (
    <Shell links={clientLinks}>
      <h1>I tuoi progressi</h1>
      <p className="mu">Gli ultimi due mesi</p>
      <ProgressView sessions={m.get(user.id) ?? []} lift={lift} />
      <section className="card">
        <h3>Le tue foto</h3>
        <p className="mu" style={{ marginTop: 4 }}>Una all’inizio, una oggi. Le vede solo Coach Raphi. Stessa luce, stessa distanza, stessa posa.</p>
        <div className="g2">
          <PhotoSlot kind="before" label="Prima" url={p.before?.url} at={p.before?.at} userId={user.id} />
          <PhotoSlot kind="after" label="Dopo" url={p.after?.url} at={p.after?.at} userId={user.id} />
        </div>
      </section>
    </Shell>
  )
}
