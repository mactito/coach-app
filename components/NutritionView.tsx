'use client'
import { useState } from 'react'
import DayTotal from '@/components/DayTotal'
import { DAYS, FULL, kcal, type Meal, type Target } from '@/lib/nutrition'

export default function NutritionView({ meals, target, startDay }: { meals: Meal[]; target: Target; startDay: number }) {
  const [day, setDay] = useState(startDay)
  const list = meals.filter(m => m.day === day).sort((a, b) => a.position - b.position)
  return (
    <section className="card">
      <h3>{FULL[day]}{day === startDay ? ' · oggi' : ''}</h3>
      <div className="dys">{DAYS.map((d, i) => <button key={d} className={i === day ? 'on' : ''} onClick={() => setDay(i)} aria-label={FULL[i]}>{d}</button>)}</div>
      {list.length === 0 && <p className="mu" style={{ marginTop: 12 }}>Nessun pasto previsto per questo giorno.</p>}
      {list.map(m => (
        <div key={m.id} className="lr"><b>{m.title}</b><span className="mu" style={{ textAlign: 'right' }}>{m.description}<br />{kcal(m)} kcal · P {m.protein} · C {m.carbs} · G {m.fat}</span></div>
      ))}
      <DayTotal meals={list} target={target} />
    </section>
  )
}
