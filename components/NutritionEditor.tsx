'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DayTotal from '@/components/DayTotal'
import { DAYS, FULL, kcal, todayIndex, type Meal, type Target } from '@/lib/nutrition'

const uid = () => crypto.randomUUID()
const MACROS = [['protein', 'Prot. (g)'], ['carbs', 'Carb. (g)'], ['fat', 'Grassi (g)']] as const

export default function NutritionEditor({ clientId, initialMeals, initialTarget }: { clientId: string; initialMeals: Meal[]; initialTarget: Target }) {
  const sb = createClient()
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [target, setTarget] = useState<Target>(initialTarget)
  const [day, setDay] = useState(todayIndex())
  const [msg, setMsg] = useState('')
  const saved = useRef(new Set(initialMeals.map(m => m.id)))
  const list = meals.filter(m => m.day === day).sort((a, b) => a.position - b.position)
  const patch = (id: string, p: Partial<Meal>) => setMeals(meals.map(m => (m.id === id ? { ...m, ...p } : m)))

  const add = () => setMeals([...meals, { id: uid(), day, position: list.length, title: 'Pasto', description: '', protein: 0, carbs: 0, fat: 0 }])
  const copyAll = () => {
    const others = [0, 1, 2, 3, 4, 5, 6].filter(d => d !== day).flatMap(d => list.map((m, i) => ({ ...m, id: uid(), day: d, position: i })))
    setMeals([...list, ...others]); setMsg(`I pasti di ${FULL[day]} sono stati copiati su tutti i giorni. Ricorda di salvare.`)
  }
  async function save() {
    setMsg('')
    const rows = meals.map(m => ({ ...m, client_id: clientId }))
    const e1 = (await sb.from('nutrition_targets').upsert({ client_id: clientId, ...target, updated_at: new Date().toISOString() })).error
    if (e1) return setMsg(e1.message)
    if (rows.length) { const e2 = (await sb.from('meals').upsert(rows)).error; if (e2) return setMsg(e2.message) }
    const gone = [...saved.current].filter(id => !meals.some(m => m.id === id))
    if (gone.length) { const e3 = (await sb.from('meals').delete().in('id', gone)).error; if (e3) return setMsg(e3.message) }
    saved.current = new Set(meals.map(m => m.id))
    setMsg('Piano salvato. Il cliente lo vede subito.')
  }

  return (
    <>
      <section className="card">
        <h3>Obiettivi giornalieri</h3>
        <div className="mm" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginTop: 10 }}>
          {([['kcal', 'Calorie'], ...MACROS] as const).map(([k, l]) => (
            <label key={k}>{l}<input type="number" min={0} value={target[k]} onChange={e => setTarget({ ...target, [k]: Math.max(0, +e.target.value || 0) })} /></label>
          ))}
        </div>
      </section>
      <section className="card">
        <h3>{FULL[day]}</h3>
        <div className="dys">{DAYS.map((d, i) => <button key={d} className={i === day ? 'on' : ''} onClick={() => setDay(i)} aria-label={FULL[i]}>{d}</button>)}</div>
        {list.map(m => (
          <div key={m.id} className="mrow">
            <input className="mi" style={{ gridColumn: 'auto', fontWeight: 700 }} value={m.title} onChange={e => patch(m.id, { title: e.target.value })} aria-label="Nome del pasto" />
            <button className="x" onClick={() => setMeals(meals.filter(x => x.id !== m.id))}>Rimuovi</button>
            <input className="mi" placeholder="Descrizione del pasto" value={m.description} onChange={e => patch(m.id, { description: e.target.value })} />
            <div className="mm">
              {MACROS.map(([k, l]) => <label key={k}>{l}<input type="number" min={0} value={m[k]} onChange={e => patch(m.id, { [k]: Math.max(0, +e.target.value || 0) })} /></label>)}
              <span className="mk">{kcal(m)} kcal</span>
            </div>
          </div>
        ))}
        <DayTotal meals={list} target={target} />
        <button className="btn s" onClick={add}>Aggiungi pasto</button>
        <button className="btn s" onClick={copyAll} disabled={list.length === 0}>Copia {DAYS[day]} su tutti i giorni</button>
      </section>
      <button className="btn" onClick={save}>Salva piano</button>
      {msg && <p className="mu" style={{ marginTop: 10 }}>{msg}</p>}
    </>
  )
}
