import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell, { trainerLinks } from '@/components/Shell'
import NutritionEditor from '@/components/NutritionEditor'
import { requireRole } from '@/lib/auth'
import { DEFAULT_TARGET, type Meal } from '@/lib/nutrition'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sb } = await requireRole('trainer')
  const [p, t, m] = await Promise.all([
    sb.from('profiles').select('full_name').eq('id', id).eq('role', 'client').single(),
    sb.from('nutrition_targets').select('kcal, protein, carbs, fat').eq('client_id', id).maybeSingle(),
    sb.from('meals').select('*').eq('client_id', id).order('position'),
  ])
  if (!p.data) notFound()
  return (
    <Shell links={trainerLinks}>
      <Link className="back" href="/trainer">‹ Clienti</Link>
      <h1>{p.data.full_name || 'Senza nome'}</h1>
      <Link className="btn s" href={`/trainer/chat/${id}`}>Scrivi un messaggio</Link>
      <h3 style={{ marginTop: 20 }}>Piano alimentare</h3>
      <NutritionEditor clientId={id} initialMeals={(m.data ?? []) as Meal[]} initialTarget={t.data ?? DEFAULT_TARGET} />
    </Shell>
  )
}
