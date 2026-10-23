'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Ex = { id: string; name: string; sets: number; reps: number; video: string | null }
type Log = { workout_exercise_id: string; set_no: number; kg: number | null; reps: number | null }
type Row = { kg: string; reps: string; done: boolean }
const k = (e: string, n: number) => `${e}:${n}`

export default function Logger({ assignmentId, exercises, logs }: { assignmentId: string; exercises: Ex[]; logs: Log[] }) {
  const sb = createClient()
  const [rows, setRows] = useState<Record<string, Row>>(() => {
    const r: Record<string, Row> = {}
    exercises.forEach(e => {
      for (let n = 1; n <= e.sets; n++) {
        const l = logs.find(x => x.workout_exercise_id === e.id && x.set_no === n)
        r[k(e.id, n)] = l ? { kg: String(l.kg ?? ''), reps: String(l.reps ?? ''), done: true } : { kg: '', reps: String(e.reps), done: false }
      }
    })
    return r
  })
  const [err, setErr] = useState('')
  const all = Object.values(rows)
  const done = all.filter(r => r.done).length
  const edit = (key: string, patch: Partial<Row>) => setRows(p => ({ ...p, [key]: { ...p[key], ...patch } }))

  async function toggle(e: Ex, n: number) {
    const key = k(e.id, n), r = rows[key]
    setErr('')
    const q = r.done
      ? sb.from('set_logs').delete().match({ assignment_id: assignmentId, workout_exercise_id: e.id, set_no: n })
      : sb.from('set_logs').upsert({ assignment_id: assignmentId, workout_exercise_id: e.id, set_no: n, kg: Number(r.kg.replace(',', '.')) || null, reps: Number(r.reps) || null }, { onConflict: 'assignment_id,workout_exercise_id,set_no' })
    const { error } = await q
    if (error) return setErr(error.message)
    edit(key, { done: !r.done })
  }

  return (
    <>
      <div className="prog"><div className="bar"><i style={{ width: `${(done / Math.max(1, all.length)) * 100}%` }} /></div><span>{done} serie su {all.length}</span></div>
      {exercises.map(e => (
        <section key={e.id} className="card">
          <div className="eh"><h3>{e.name}</h3>{e.video && <a className="chip vb" style={{ textDecoration: 'none' }} href={e.video} target="_blank" rel="noopener">Guarda demo</a>}</div>
          <div className="sr h"><span>Serie</span><span></span><span>kg</span><span>Rip.</span><span></span></div>
          {Array.from({ length: e.sets }, (_, i) => i + 1).map(n => {
            const key = k(e.id, n), r = rows[key]
            return (
              <div key={n} className="sr">
                <span>{n}</span><span></span>
                <input inputMode="decimal" aria-label={`Chilogrammi, serie ${n}`} value={r.kg} onChange={ev => edit(key, { kg: ev.target.value })} />
                <input inputMode="numeric" aria-label={`Ripetizioni, serie ${n}`} value={r.reps} onChange={ev => edit(key, { reps: ev.target.value })} />
                <button className={`ck${r.done ? ' on' : ''}`} onClick={() => toggle(e, n)} aria-label={`Segna la serie ${n} come fatta`}>✓</button>
              </div>
            )
          })}
        </section>
      ))}
      {done === all.length && all.length > 0 && <p className="chip" style={{ display: 'inline-block', marginTop: 14 }}>Allenamento completato. Ottimo lavoro!</p>}
      {err && <p className="err">{err}</p>}
    </>
  )
}
