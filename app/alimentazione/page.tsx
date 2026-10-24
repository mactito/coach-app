import Shell, { clientLinks } from '@/components/Shell'
import NutritionView from '@/components/NutritionView'
import { requireRole } from '@/lib/auth'
import { DEFAULT_TARGET, todayIndex, type Meal } from '@/lib/nutrition'

export default async function Alimentazione() {
  const { sb, user } = await requireRole('client')
  const [t, m] = await Promise.all([
    sb.from('nutrition_targets').select('kcal, protein, carbs, fat').eq('client_id', user.id).maybeSingle(),
    sb.from('meals').select('*').eq('client_id', user.id).order('position'),
  ])
  const meals = (m.data ?? []) as Meal[]
  return (
    <Shell links={clientLinks}>
      <h1>Piano alimentare</h1>
      <p className="mu">Impostato da Coach Raphi · 7 giorni</p>
      {meals.length === 0 ? <p className="mu" style={{ marginTop: 14 }}>Raphi non ha ancora creato il tuo piano alimentare.</p>
        : <NutritionView meals={meals} target={t.data ?? DEFAULT_TARGET} startDay={todayIndex()} />}
    </Shell>
  )
}
