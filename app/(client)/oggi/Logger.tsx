'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Demo from '@/components/Demo'
import Sheet from '@/components/Sheet'
import { toast } from '@/lib/toast'
import { tap } from '@/lib/native'

type Ex = { id: string; name: string; sets: number; reps: number; rest: number; video: string | null }
type Log = { workout_exercise_id: string; set_no: number; kg: number | null; reps: number | null }
type Row = { kg: string; reps: string; done: boolean }
const k = (e: string, n: number) => `${e}:${n}`
const RATES = ['Facile', 'Giusto', 'Duro']

export default function Logger({ assignmentId, clientId, workoutName, exercises, logs, prev }: { assignmentId: string; clientId: string; workoutName: string; exercises: Ex[]; logs: Log[]; prev: Record<string, string> }) {
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
  const [end, setEnd] = useState<number | null>(null)
  const [left, setLeft] = useState(0)
  const [sheet, setSheet] = useState(false)
  const [rate, setRate] = useState(1)
  const [note, setNote] = useState('')
  const all = Object.values(rows)
  const done = all.filter(r => r.done).length
  const edit = (key: string, patch: Partial<Row>) => setRows(p => ({ ...p, [key]: { ...p[key], ...patch } }))

  useEffect(() => {
    if (!end) return
    const t = setInterval(() => {
      const l = Math.ceil((end - Date.now()) / 1000)
      if (l <= 0) { setEnd(null); navigator.vibrate?.(200); toast('Recupero finito: tocca alla prossima serie!') } else setLeft(l)
    }, 250)
    return () => clearInterval(t)
  }, [end])

  async function toggle(e: Ex, n: number) {
    const key = k(e.id, n), r = rows[key]
    const q = r.done
      ? sb.from('set_logs').delete().match({ assignment_id: assignmentId, workout_exercise_id: e.id, set_no: n })
      : sb.from('set_logs').upsert({ assignment_id: assignmentId, workout_exercise_id: e.id, set_no: n, kg: Number(r.kg.replace(',', '.')) || null, reps: Number(r.reps) || null }, { onConflict: 'assignment_id,workout_exercise_id,set_no' })
    const { error } = await q
    if (error) return toast(error.message)
    edit(key, { done: !r.done })
    if (!r.done) void tap()
    if (!r.done && e.rest > 0) { setEnd(Date.now() + e.rest * 1000); setLeft(e.rest) } else setEnd(null)
  }
  async function finish(withNote: boolean) {
    if (withNote) {
      const body = `Dopo l’allenamento · ${workoutName} · ${RATES[rate]}${note.trim() ? ': ' + note.trim() : ''}`
      const { error } = await sb.from('messages').insert({ client_id: clientId, body })
      if (error) return toast(error.message)
    }
    setSheet(false); setEnd(null)
    toast(withNote ? 'Allenamento salvato. Raphi riceve il tuo commento.' : 'Allenamento salvato. Coach Raphi può vederlo.')
  }
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  return (
    <>
      <div className="prog"><div className="bar"><i style={{ width: `${(done / Math.max(1, all.length)) * 100}%` }} /></div><span>{done} serie su {all.length}</span></div>
      {exercises.map(e => (
        <section key={e.id} className="card">
          <div className="eh"><h3>{e.name}</h3>{e.video && <Demo name={e.name} url={e.video} />}</div>
          <p className="mu">{e.sets} serie da {e.reps} ripetizioni{e.rest > 0 ? ` · recupero ${e.rest} s` : ''}</p>
          <div className="sr h"><span>Serie</span><span>Ultima volta</span><span>kg</span><span>Rip.</span><span></span></div>
          {Array.from({ length: e.sets }, (_, i) => i + 1).map(n => {
            const key = k(e.id, n), r = rows[key]
            return (
              <div key={n} className="sr">
                <span>{n}</span><span className="mu">{prev[key] ?? '—'}</span>
                <input inputMode="decimal" aria-label={`Chilogrammi, serie ${n}`} value={r.kg} onChange={ev => edit(key, { kg: ev.target.value })} />
                <input inputMode="numeric" aria-label={`Ripetizioni, serie ${n}`} value={r.reps} onChange={ev => edit(key, { reps: ev.target.value })} />
                <button className={`ck${r.done ? ' on' : ''}`} onClick={() => toggle(e, n)} aria-label={`Segna la serie ${n} come fatta`}>✓</button>
              </div>
            )
          })}
        </section>
      ))}
      <button className="btn" disabled={done < all.length} onClick={() => setSheet(true)}>{done < all.length ? `Mancano ${all.length - done} serie` : 'Concludi allenamento'}</button>
      {end && (
        <div className="rtfix"><div className="rtb"><div><small>Recupero</small><b>{mmss}</b></div><button onClick={() => setEnd(end + 30000)}>+30 s</button><button onClick={() => setEnd(null)}>Salta</button></div></div>
      )}
      {sheet && (
        <Sheet onClose={() => setSheet(false)}>
          <h3>Com’è andata?</h3>
          <p className="mu">Raphi legge il tuo commento e ti risponde in chat.</p>
          <div className="dys" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{RATES.map((r, i) => <button key={r} className={i === rate ? 'on' : ''} onClick={() => setRate(i)}>{r}</button>)}</div>
          <textarea className="tn" rows={4} style={{ height: 'auto', padding: '10px 12px' }} placeholder="Scrivi a Raphi: com’è andata, cosa è stato difficile…" value={note} onChange={e => setNote(e.target.value)} />
          <button className="btn" onClick={() => finish(true)}>Invia e concludi</button>
          <button className="btn s" onClick={() => finish(false)}>Concludi senza commento</button>
        </Sheet>
      )}
    </>
  )
}
