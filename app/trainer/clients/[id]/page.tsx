import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell, { trainerLinks } from '@/components/Shell'
import NutritionEditor from '@/components/NutritionEditor'
import ProgressView from '@/components/ProgressView'
import PhotoPair from '@/components/PhotoPair'
import { requireRole } from '@/lib/auth'
import { fmtDay, todayRome } from '@/lib/dates'
import { DEFAULT_TARGET, type Meal } from '@/lib/nutrition'
import { latestPhotos, loadLift, loadSessions, weekDots } from '@/lib/sessions'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sb } = await requireRole('trainer')
  const [p, t, m, ses, lift, photos] = await Promise.all([
    sb.from('profiles').select('full_name').eq('id', id).eq('role', 'client').single(),
    sb.from('nutrition_targets').select('kcal, protein, carbs, fat').eq('client_id', id).maybeSingle(),
    sb.from('meals').select('*').eq('client_id', id).order('position'),
    loadSessions(sb, [id]), loadLift(sb, id), latestPhotos(sb, id),
  ])
  if (!p.data) notFound()
  const name = p.data.full_name || 'Senza nome'
  const sessions = ses.get(id) ?? [], dots = weekDots(sessions), today = todayRome()
  const upcoming = sessions.filter(s => s.date >= today)
  const sym: Record<string, string> = { d: '✓', m: '–', p: '', r: '' }
  return (
    <Shell links={trainerLinks}>
      <Link className="back" href="/trainer">‹ Clienti</Link>
      <h1>{name}</h1>
      <section className="card">
        <h3>Questa settimana</h3>
        <div className="wk">{'LMMGVSD'.split('').map((d, i) => <div key={i}>{d}<b className={`${dots[i]}${i === (new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })).getDay() + 6) % 7 ? ' td' : ''}`}>{sym[dots[i]]}</b></div>)}</div>
      </section>
      <ProgressView sessions={sessions} lift={lift} />
      <section className="card">
        <h3>In programma</h3>
        {upcoming.length === 0 ? <p className="mu" style={{ marginTop: 4 }}>Nessun allenamento assegnato. Assegnalo dalla scheda Allenamenti.</p>
          : upcoming.map(s => <div key={s.id} className="lr"><span>{fmtDay(s.date)}</span><b>{s.name}</b></div>)}
      </section>
      <PhotoPair photos={photos} name={name.split(' ')[0]} />
      <Link className="btn s" href={`/trainer/chat/${id}`}>Scrivi un messaggio</Link>
      <h3 style={{ marginTop: 20 }}>Piano alimentare</h3>
      <NutritionEditor clientId={id} initialMeals={(m.data ?? []) as Meal[]} initialTarget={t.data ?? DEFAULT_TARGET} />
    </Shell>
  )
}
