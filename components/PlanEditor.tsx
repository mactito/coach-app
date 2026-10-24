'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ExercisePicker, { type LibEx } from '@/components/ExercisePicker'
import Stepper from '@/components/Stepper'
import { toast } from '@/lib/toast'

export type PlanItem = { id: string; exercise_id: string; name: string; sets: number; reps: number; video_url: string | null }

// Editing one client's upcoming day. Changes only affect this client: shared workout models are copied first.
export default function PlanEditor({ assignmentId, workout, initial, library, clientName, dayLabel }: {
  assignmentId: string; workout: { id: string; name: string; is_custom: boolean }; initial: PlanItem[]; library: LibEx[]; clientName: string; dayLabel: string
}) {
  const sb = createClient()
  const router = useRouter()
  const [items, setItems] = useState<PlanItem[]>(initial)
  const [pick, setPick] = useState(false)
  const [busy, setBusy] = useState(false)
  const patch = (i: number, p: Partial<PlanItem>) => setItems(items.map((it, k) => (k === i ? { ...it, ...p } : it)))

  async function save() {
    if (!items.length) return toast('Aggiungi almeno un esercizio, oppure rimuovi l’allenamento da questo giorno.')
    setBusy(true)
    let wid = workout.id
    const inPlace = workout.is_custom
    if (!inPlace) {
      const { data, error } = await sb.from('workouts').insert({ name: workout.name, is_custom: true }).select('id').single()
      if (error || !data) { setBusy(false); return toast(error?.message ?? 'Errore') }
      wid = data.id
    }
    const rows = items.map((it, i) => ({ id: inPlace ? it.id : crypto.randomUUID(), workout_id: wid, exercise_id: it.exercise_id, position: i, sets: it.sets, reps: it.reps, video_url: it.video_url }))
    const e2 = (await sb.from('workout_exercises').upsert(rows)).error
    if (e2) { setBusy(false); return toast(e2.message) }
    if (inPlace) {
      const gone = initial.map(x => x.id).filter(id => !items.some(i => i.id === id))
      if (gone.length) { const e3 = (await sb.from('workout_exercises').delete().in('id', gone)).error; if (e3) { setBusy(false); return toast(e3.message) } }
    } else {
      const e4 = (await sb.from('assignments').update({ workout_id: wid }).eq('id', assignmentId)).error
      if (e4) { setBusy(false); return toast(e4.message) }
    }
    setBusy(false); toast(`Modifiche salvate per ${clientName}.`); router.refresh()
  }
  async function removeDay() {
    if (!confirm(`Rimuovere “${workout.name}” da ${dayLabel}?`)) return
    const { error } = await sb.from('assignments').delete().eq('id', assignmentId)
    if (error) return toast(error.message)
    if (workout.is_custom) await sb.from('workouts').delete().eq('id', workout.id)
    toast('Allenamento rimosso da questo giorno'); router.refresh()
  }

  return (
    <>
      <p className="mu" style={{ marginTop: 6 }}>{workout.name} · le modifiche valgono solo per {clientName}, il modello resta com’è.</p>
      {items.map((it, i) => (
        <section key={it.id} className="card">
          <div className="eh"><h3>{it.name}</h3><button className="x" onClick={() => setItems(items.filter((_, k) => k !== i))} aria-label={`Rimuovi ${it.name}`}>Rimuovi</button></div>
          <Stepper label="Serie" value={it.sets} onChange={d => patch(i, { sets: Math.max(1, it.sets + d) })} />
          <Stepper label="Rip." value={it.reps} onChange={d => patch(i, { reps: Math.max(1, it.reps + d) })} />
        </section>
      ))}
      <button className="btn s" onClick={() => setPick(true)}>Aggiungi esercizio</button>
      <button className="btn" onClick={save} disabled={busy}>{busy ? 'Salvataggio…' : 'Salva modifiche'}</button>
      <button className="x" style={{ marginTop: 12 }} onClick={removeDay}>Rimuovi allenamento da questo giorno</button>
      {pick && <ExercisePicker library={library} onClose={() => setPick(false)} onPick={x => { setItems([...items, { id: crypto.randomUUID(), exercise_id: x.id, name: x.name, sets: 3, reps: 10, video_url: x.video_url }]); setPick(false); toast(`“${x.name}” aggiunto`) }} />}
    </>
  )
}
