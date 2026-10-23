'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Ex = { id: string; name: string; sets: number; reps: number; video: string | null }
type Log = { workout_exercise_id: string; set_no: number; kg: number | null; reps: number | null }
type Row = { kg: string; reps: string; done: boolean }
const k = (e: string, n: number) => `${e}:${n}`
const RATES = ['Facile', 'Giusto', 'Duro']

export default function Logger({ assignmentId, clientId, workoutName, exercises, logs }: { assignmentId: string; clientId: string; workoutName: string; exercises: Ex[]; logs: Log[] }) {
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
  const [rest, setRest] = useState(90)
  const [end, setEnd] = useState<number | null>(null)
  const [left, setLeft] = useState(0)
  const [rate, setRate] = useState(1)
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const all = Object.values(rows)
  const done = all.filter(r => r.done).length
  const edit = (key: string, patch: Partial<Row>) => setRows(p => ({ ...p, [key]: { ...p[key], ...patch } }))

  useEffect(() => {
    if (!end) return
    const t = setInterval(() => {
      const l = Math.ceil((end - Date.now()) / 1000)
      if (l <= 0) { setEnd(null); navigator.vibrate?.(200) } else setLeft(l)
    }, 250)
    return () => clearInterval(t)
  }, [end])

  async function toggle(e: Ex, n: number) {
    const key = k(e.id, n), r = rows[key]
    setErr('')
    const q = r.done
      ? sb.from('set_logs').delete().match({ assignment_id: assignmentId, workout_exercise_id: e.id, set_no: n })
      : sb.from('set_logs').upsert({ assignment_id: assignmentId, workout_exercise_id: e.id, set_no: n, kg: Number(r.kg.replace(',', '.')) || null, reps: Number(r.reps) || null }, { onConflict: 'assignment_id,workout_exercise_id,set_no' })
    const { error } = await q
    if (error) return setErr(error.message)
    edit(key, { done: !r.done })
    if (!r.done) { setEnd(Date.now() + rest * 1000); setLeft(rest) } else setEnd(null)
  }
  async function sendNote() {
    const body = `Dopo l’allenamento · ${workoutName} · ${RATES[rate]}${note.trim() ? ': ' + note.trim() : ''}`
    const { error } = await sb.from('messages').insert({ client_id: clientId, body })
    if (error) return setErr(error.message)
    setSent(true)
  }
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  return (
    <>
      <div className="prog"><div className="bar"><i style={{ width: `${(done / Math.max(1, all.length)) * 100}%` }} /></div><span>{done} serie su {all.length}</span></div>
      <div className="dys" style={{ gridTemplateColumns: 'auto repeat(3,1fr)', alignItems: 'center', marginTop: 10 }}>
        <span className="mu" style={{ paddingRight: 4 }}>Recupero</span>
        {[60, 90, 120].map(v => <button key={v} className={rest === v ? 'on' : ''} onClick={() => setRest(v)}>{v} s</button>)}
      </div>
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
      {done === all.length && all.length > 0 && (
        <section className="card">
          <h3>Com’è andata?</h3>
          {sent ? <p className="mu" style={{ marginTop: 6 }}>Inviato a Raphi. Ti risponde in chat.</p> : (
            <>
              <div className="dys" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{RATES.map((r, i) => <button key={r} className={i === rate ? 'on' : ''} onClick={() => setRate(i)}>{r}</button>)}</div>
              <textarea className="tn" rows={3} style={{ height: 'auto', padding: '10px 12px' }} placeholder="Scrivi a Raphi: com’è andata, cosa è stato difficile…" value={note} onChange={e => setNote(e.target.value)} />
              <button className="btn" onClick={sendNote}>Invia a Raphi</button>
            </>
          )}
        </section>
      )}
      {err && <p className="err">{err}</p>}
      {end && (
        <div className="rtfix"><div className="rtb"><div><small>Recupero</small><b>{mmss}</b></div><button onClick={() => setEnd(end + 30000)}>+30 s</button><button onClick={() => setEnd(null)}>Salta</button></div></div>
      )}
    </>
  )
}
