'use client'
import { useState } from 'react'
import DayTotal from '@/components/DayTotal'
import { DAYS, FULL, kcal, type Meal, type Target } from '@/lib/nutrition'

export default function NutritionView({ meals, target, startDay }: { meals: Meal[]; target: Target; startDay: number }) {
  const [day, setDay] = useState(startDay)
  const list = meals.filter(m => m.day === day).sort((a, b) => a.position - b.position)
  const m = target.protein * 4 + target.carbs * 4 + target.fat * 9 || 1
  const mac = (l: string, g: number, k: number) => (
    <div className="mac"><div><span>{l}</span><b>{g} g</b></div><div className="bar a"><i style={{ width: `${Math.min(100, (g * k) / m * 100)}%` }} /></div></div>
  )
  return (
    <>
      <section className="card">
        <b className="big">{target.kcal.toLocaleString('it-IT')} kcal</b><p className="mu">obiettivo giornaliero</p>
        {mac('Proteine', target.protein, 4)}{mac('Carboidrati', target.carbs, 4)}{mac('Grassi', target.fat, 9)}
      </section>
      <section className="card">
        <h3>{FULL[day]}{day === startDay ? ' · oggi' : ''}</h3>
        <div className="dys">{DAYS.map((d, i) => <button key={d} className={i === day ? 'on' : ''} onClick={() => setDay(i)} aria-label={FULL[i]}>{d}</button>)}</div>
        {list.length === 0 && <p className="mu" style={{ marginTop: 12 }}>Nessun pasto previsto per questo giorno.</p>}
        {list.map(x => (
          <div key={x.id} className="lr"><b>{x.title}</b><span className="mu" style={{ textAlign: 'right' }}>{x.description}<br />{kcal(x)} kcal · P {x.protein} · C {x.carbs} · G {x.fat}</span></div>
        ))}
        <DayTotal meals={list} target={target} />
      </section>
    </>
  )
}
