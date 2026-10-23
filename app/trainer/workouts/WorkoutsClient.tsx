'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Ex = { id: string; name: string; muscle: string | null; video_url: string | null }
type Cl = { id: string; full_name: string | null }
type WE = { id: string; exercise_id: string; sets: number; reps: number; video_url: string | null; position: number }
type Wo = { id: string; name: string; workout_exercises: WE[] }
type Item = { id: string; exercise_id: string; sets: number; reps: number; video_url: string }
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
const uid = () => crypto.randomUUID()

export default function WorkoutsClient({ exercises, clients, workouts }: { exercises: Ex[]; clients: Cl[]; workouts: Wo[] }) {
  const sb = createClient()
  const router = useRouter()
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [newEx, setNewEx] = useState({ name: '', muscle: '', video_url: '' })
  const [open, setOpen] = useState<string | null>(null)
  const [ids, setIds] = useState<string[]>([])
  const [date, setDate] = useState(today())
  const [msg, setMsg] = useState('')
  const exName = (id: string) => exercises.find(e => e.id === id)?.name ?? ''
  const setItem = (i: number, patch: Partial<Item>) => setItems(items.map((it, k) => (k === i ? { ...it, ...patch } : it)))
  const reset = () => { setEditId(null); setName(''); setItems([]) }

  function edit(w: Wo) {
    setEditId(w.id); setName(w.name); setMsg('')
    setItems([...w.workout_exercises].sort((a, b) => a.position - b.position).map(e => ({ id: e.id, exercise_id: e.exercise_id, sets: e.sets, reps: e.reps, video_url: e.video_url ?? '' })))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  async function duplicate(w: Wo) {
    const { data, error } = await sb.from('workouts').insert({ name: `${w.name} (copia)` }).select('id').single()
    if (error || !data) return setMsg(error?.message ?? 'Errore')
    const rows = w.workout_exercises.map(e => ({ id: uid(), workout_id: data.id, exercise_id: e.exercise_id, position: e.position, sets: e.sets, reps: e.reps, video_url: e.video_url }))
    const e2 = rows.length ? (await sb.from('workout_exercises').insert(rows)).error : null
    if (e2) return setMsg(e2.message)
    setMsg('Allenamento duplicato.'); router.refresh()
  }
  async function addExercise() {
    if (!newEx.name.trim()) return setMsg('Dai un nome all’esercizio.')
    const { error } = await sb.from('exercises').insert({ name: newEx.name.trim(), muscle: newEx.muscle.trim() || null, video_url: newEx.video_url.trim() || null })
    if (error) return setMsg(error.message)
    setNewEx({ name: '', muscle: '', video_url: '' }); setMsg('Esercizio salvato in libreria.'); router.refresh()
  }
  async function save() {
    if (!name.trim() || !items.length) return setMsg('Scrivi un nome e aggiungi almeno un esercizio.')
    let wid = editId
    if (wid) {
      const { error } = await sb.from('workouts').update({ name: name.trim() }).eq('id', wid)
      if (error) return setMsg(error.message)
    } else {
      const { data, error } = await sb.from('workouts').insert({ name: name.trim() }).select('id').single()
      if (error || !data) return setMsg(error?.message ?? 'Errore')
      wid = data.id
    }
    const rows = items.map((it, i) => ({ id: it.id, workout_id: wid, exercise_id: it.exercise_id, position: i, sets: it.sets, reps: it.reps, video_url: it.video_url.trim() || null }))
    const e2 = (await sb.from('workout_exercises').upsert(rows)).error
    if (e2) return setMsg(e2.message)
    if (editId) {
      const keep = items.map(i => i.id)
      const gone = (workouts.find(w => w.id === editId)?.workout_exercises ?? []).map(e => e.id).filter(id => !keep.includes(id))
      if (gone.length) { const e3 = (await sb.from('workout_exercises').delete().in('id', gone)).error; if (e3) return setMsg(e3.message) }
    }
    reset(); setMsg('Allenamento salvato.'); router.refresh()
  }
  async function assign(workoutId: string) {
    if (!ids.length) return setMsg('Scegli almeno un cliente.')
    const rows = ids.map(client_id => ({ workout_id: workoutId, client_id, scheduled_on: date }))
    const { error } = await sb.from('assignments').upsert(rows, { onConflict: 'client_id,scheduled_on' })
    if (error) return setMsg(error.message)
    setOpen(null); setIds([]); setMsg(`Assegnato a ${rows.length} ${rows.length > 1 ? 'clienti' : 'cliente'}.`); router.refresh()
  }

  return (
    <>
      {msg && <p className="mu" style={{ marginTop: 10 }}>{msg}</p>}
      <section className="card">
        <div className="eh"><h3>{editId ? 'Modifica allenamento' : 'Nuovo allenamento'}</h3>{editId && <button className="x" onClick={reset}>Annulla</button>}</div>
        <input className="tn" placeholder="Nome, es. Giorno schiena" value={name} onChange={e => setName(e.target.value)} />
        {items.map((it, i) => (
          <div key={it.id} style={{ marginTop: 12 }}>
            <div className="srow" style={{ marginTop: 0 }}>
              <b>{exName(it.exercise_id)}</b>
              <span className="stp">
                <input className="tn" style={{ width: 56, margin: 0, textAlign: 'center' }} type="number" min={1} value={it.sets} onChange={e => setItem(i, { sets: +e.target.value })} aria-label="Serie" />
                ×
                <input className="tn" style={{ width: 56, margin: 0, textAlign: 'center' }} type="number" min={1} value={it.reps} onChange={e => setItem(i, { reps: +e.target.value })} aria-label="Ripetizioni" />
                <button className="x" onClick={() => setItems(items.filter((_, k) => k !== i))}>Rimuovi</button>
              </span>
            </div>
            <input className="mi" style={{ marginTop: 6 }} placeholder="Link video per questo esercizio" value={it.video_url} onChange={e => setItem(i, { video_url: e.target.value })} aria-label={`Link video: ${exName(it.exercise_id)}`} />
          </div>
        ))}
        <select className="tn" value="" onChange={e => { const x = exercises.find(v => v.id === e.target.value); if (x) setItems([...items, { id: uid(), exercise_id: x.id, sets: 3, reps: 10, video_url: x.video_url ?? '' }]) }}>
          <option value="">Aggiungi esercizio…</option>
          {exercises.map(e => <option key={e.id} value={e.id}>{e.name}{e.muscle ? ` · ${e.muscle}` : ''}</option>)}
        </select>
        <button className="btn" onClick={save}>{editId ? 'Aggiorna allenamento' : 'Salva allenamento'}</button>
      </section>

      <section className="card">
        <h3>Crea un nuovo esercizio</h3>
        <input className="tn" placeholder="Nome dell’esercizio" value={newEx.name} onChange={e => setNewEx({ ...newEx, name: e.target.value })} />
        <input className="tn" placeholder="Gruppo muscolare, es. Petto" value={newEx.muscle} onChange={e => setNewEx({ ...newEx, muscle: e.target.value })} />
        <input className="tn" placeholder="Link video (facoltativo)" value={newEx.video_url} onChange={e => setNewEx({ ...newEx, video_url: e.target.value })} />
        <button className="btn s" onClick={addExercise}>Salva in libreria</button>
      </section>

      {workouts.map(w => (
        <section key={w.id} className="card">
          <div className="eh"><h3>{w.name}</h3><span className="chip">{w.workout_exercises?.length ?? 0} esercizi</span></div>
          <p className="mu" style={{ marginTop: 4 }}>{[...w.workout_exercises].sort((a, b) => a.position - b.position).map(e => exName(e.exercise_id)).join(', ')}</p>
          {open === w.id ? (
            <>
              {clients.map(c => (
                <label key={c.id} className="row">
                  <input type="checkbox" checked={ids.includes(c.id)} onChange={() => setIds(ids.includes(c.id) ? ids.filter(x => x !== c.id) : [...ids, c.id])} />
                  <b>{c.full_name || 'Senza nome'}</b>
                </label>
              ))}
              <input className="tn" type="date" value={date} onChange={e => setDate(e.target.value)} />
              <button className="btn" onClick={() => assign(w.id)}>Assegna</button>
            </>
          ) : (
            <div className="g2">
              <button className="btn s" onClick={() => edit(w)}>Modifica</button>
              <button className="btn s" onClick={() => duplicate(w)}>Duplica</button>
              <button className="btn" style={{ gridColumn: '1/-1', marginTop: 0 }} onClick={() => { setOpen(w.id); setIds([]) }}>Assegna a clienti</button>
            </div>
          )}
        </section>
      ))}
    </>
  )
}
