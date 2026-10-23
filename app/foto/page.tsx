import Shell, { clientLinks } from '@/components/Shell'
import PhotoSlot from '@/components/PhotoSlot'
import { requireRole } from '@/lib/auth'
import { latestPhotos } from '@/lib/sessions'

export default async function Foto() {
  const { sb, user } = await requireRole('client')
  const p = await latestPhotos(sb, user.id)
  return (
    <Shell links={clientLinks}>
      <h1>Le tue foto</h1>
      <p className="mu">Una all’inizio, una oggi. Le vede solo Coach Raphi.</p>
      <div className="g2">
        <PhotoSlot kind="before" label="Prima" url={p.before?.url} at={p.before?.at} userId={user.id} />
        <PhotoSlot kind="after" label="Dopo" url={p.after?.url} at={p.after?.at} userId={user.id} />
      </div>
      <section className="card"><h3>Per un confronto giusto</h3><p className="mu" style={{ marginTop: 4 }}>Stessa luce, stessa distanza e stessa posa in ogni foto.</p></section>
    </Shell>
  )
}
