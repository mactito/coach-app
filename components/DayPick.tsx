'use client'
import { useState } from 'react'
import { DAYS } from '@/lib/nutrition'
import { addDays, todayRome, weekDates } from '@/lib/dates'

export default function DayPick({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const [off, setOff] = useState(0)
  const today = todayRome(), week = weekDates(addDays(today, off * 7))
  return (
    <>
      <div className="dys" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <button className={off === 0 ? 'on' : ''} onClick={() => setOff(0)}>Questa settimana</button>
        <button className={off === 1 ? 'on' : ''} onClick={() => setOff(1)}>Settimana prossima</button>
      </div>
      <div className="dys">
        {week.map((d, i) => <button key={d} className={d === value ? 'on' : ''} disabled={d < today} style={d < today ? { opacity: 0.4 } : undefined} onClick={() => onChange(d)} aria-label={d}>{DAYS[i]}</button>)}
      </div>
    </>
  )
}
