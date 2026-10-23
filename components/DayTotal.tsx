import { kcal, type Meal, type Target } from '@/lib/nutrition'

export default function DayTotal({ meals, target }: { meals: Meal[]; target: Target }) {
  const s = meals.reduce((a, m) => ({ p: a.p + m.protein, c: a.c + m.carbs, f: a.f + m.fat, k: a.k + kcal(m) }), { p: 0, c: 0, f: 0, k: 0 })
  const off = s.k - target.kcal, ok = Math.abs(off) <= 75
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ln)' }}>
      <div className="eh"><b>Totale del giorno</b><span className={`chip${ok ? '' : ' w'}`}>{ok ? 'In linea con l’obiettivo' : `${Math.abs(off)} kcal ${off > 0 ? 'sopra' : 'sotto'}`}</span></div>
      <div className={`bar${ok ? '' : ' wb'}`} style={{ margin: '8px 0' }}><i style={{ width: `${Math.min(100, (s.k / Math.max(1, target.kcal)) * 100)}%` }} /></div>
      <p className="mu">{s.k} / {target.kcal} kcal · P {s.p} g · C {s.c} g · G {s.f} g</p>
    </div>
  )
}
