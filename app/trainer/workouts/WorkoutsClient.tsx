'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Ex = { id: string; name: string; muscle: string | null }
type Cl = { id: string; full_name: string | null }
type Wo = { id: string; name: string; workout_exercises: { count: number }[] }
type Item = { exercise_id: string; sets: number; reps: number }
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

export default function WorkoutsClient({ exercises, clients, workouts }: { exercises: Ex[]; clients: Cl[]; workouts: Wo[] }) {
  const sb = createClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [newEx, setNewEx] = useState({ name: '', muscle: '', video_url: '' })
  const [open, setOpen] = useState<string | null>(null)
  const [ids, setIds] = useState<string[]>([])
  const [date, setDate] = useState(today())
  const [msg, setMsg] = useState('')
  const exName = (id: string) => exercises.find(e => e.id === id)?.name ?? ''
  const setItem = (i: number, patch: Partial<Item>) => setItems(items.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  async function addExercise() {
    if (!newEx.name.trim()) return setMsg('Dai un nome all’esercizio.')
    const { error } = await sb.from('exercises').insert({ name: newEx.name.trim(), muscle: newEx.muscle.trim() || null, video_url: newEx.video_url.trim() || null })
    if (error) return setMsg(error.message)
    setNewEx({ name: '', muscle: '', video_url: '' }); setMsg('Esercizio salvato in libreria.'); router.refresh()
  }
  async function save() {
    if (!name.trim() || !items.length) return setMsg('Scrivi un nome e aggiungi almeno un esercizio.')
    const { data: w, error } = await sb.from('workouts').insert({ name: name.trim() }).select('id').single()
    if (error || !w) return setMsg(error?.message ?? 'Errore')
    const rows = items.map((it, i) => ({ workout_id: w.id, exercise_id: it.exercise_id, position: i, sets: it.sets, reps: it.reps }))
    const { error: e2 } = await sb.from('workout_exercises').insert(rows)
    if (e2) return setMsg(e2.message)
    setName(''); setItems([]); setMsg('Allenamento salvato.'); router.refresh()
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
        <h3>Nuovo allenamento</h3>
        <input className="tn" placeholder="Nome, es. Giorno schiena" value={name} onChange={e => setName(e.target.value)} />
        {items.map((it, i) => (
          <div key={i} className="srow">
            <span>{exName(it.exercise_id)}</span>
            <span className="stp">
              <input className="tn" style={{ width: 56, margin: 0, textAlign: 'center' }} type="number" min={1} value={it.sets} onChange={e => setItem(i, { sets: +e.target.value })} aria-label="Serie" />
              ×
              <input className="tn" style={{ width: 56, margin: 0, textAlign: 'center' }} type="number" min={1} value={it.reps} onChange={e => setItem(i, { reps: +e.target.value })} aria-label="Ripetizioni" />
              <button className="x" onClick={() => setItems(items.filter((_, k) => k !== i))}>Rimuovi</button>
            </span>
          </div>
        ))}
        <select className="tn" value="" onChange={e => e.target.value && setItems([...items, { exercise_id: e.target.value, sets: 3, reps: 10 }])}>
          <option value="">Aggiungi esercizio…</option>
          {exercises.map(e => <option key={e.id} value={e.id}>{e.name}{e.muscle ? ` · ${e.muscle}` : ''}</option>)}
        </select>
        <button className="btn" onClick={save}>Salva allenamento</button>
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
          <div className="eh"><h3>{w.name}</h3><span className="chip">{w.workout_exercises?.[0]?.count ?? 0} esercizi</span></div>
          {open === w.id ? (
            <>
              {clients.map(c => (
                <label key={c.id} className="row" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={ids.includes(c.id)} onChange={() => setIds(ids.includes(c.id) ? ids.filter(x => x !== c.id) : [...ids, c.id])} />
                  <b>{c.full_name || 'Senza nome'}</b>
                </label>
              ))}
              <input className="tn" type="date" value={date} onChange={e => setDate(e.target.value)} />
              <button className="btn" onClick={() => assign(w.id)}>Assegna</button>
            </>
          ) : (
            <button className="btn s" onClick={() => { setOpen(w.id); setIds([]) }}>Assegna a clienti</button>
          )}
        </section>
      ))}
    </>
  )
}
