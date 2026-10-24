'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sheet from '@/components/Sheet'
import Stepper from '@/components/Stepper'
import DayPick from '@/components/DayPick'
import { toast } from '@/lib/toast'
import { todayRome, weekdayName } from '@/lib/dates'

type Ex = { id: string; name: string; muscle: string | null; video_url: string | null }
type Cl = { id: string; full_name: string | null }
type WE = { id: string; exercise_id: string; sets: number; reps: number; video_url: string | null; position: number }
type Wo = { id: string; name: string; workout_exercises: WE[] }
type Item = { id: string; exercise_id: string; name: string; sets: number; reps: number; video_url: string }
const uid = () => crypto.randomUUID()

export default function WorkoutsClient({ exercises, clients, workouts }: { exercises: Ex[]; clients: Cl[]; workouts: Wo[] }) {
  const sb = createClient()
  const router = useRouter()
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [sheet, setSheet] = useState<null | 'lib' | 'new' | 'wasg'>(null)
  const [q, setQ] = useState('')
  const [nx, setNx] = useState({ name: '', muscle: '', video_url: '' })
  const [at, setAt] = useState<Wo | null>(null)
  const [ids, setIds] = useState<string[]>([])
  const [date, setDate] = useState(todayRome())
  const exName = (id: string) => exercises.find(e => e.id === id)?.name ?? ''
  const patch = (i: number, p: Partial<Item>) => setItems(items.map((it, k) => (k === i ? { ...it, ...p } : it)))
  const reset = () => { setEditId(null); setName(''); setItems([]) }
  const add = (x: { id: string; name: string; video_url: string | null }) => {
    setItems([...items, { id: uid(), exercise_id: x.id, name: x.name, sets: 3, reps: 10, video_url: x.video_url ?? '' }])
    setSheet(null); toast(`“${x.name}” aggiunto`)
  }
  const shown = exercises.filter(e => (e.name + (e.muscle ?? '')).toLowerCase().includes(q.toLowerCase()))

  function edit(w: Wo) {
    setEditId(w.id); setName(w.name)
    setItems([...w.workout_exercises].sort((a, b) => a.position - b.position).map(e => ({ id: e.id, exercise_id: e.exercise_id, name: exName(e.exercise_id), sets: e.sets, reps: e.reps, video_url: e.video_url ?? '' })))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  async function createEx() {
    if (!nx.name.trim()) return toast('Dai un nome all’esercizio prima di salvare')
    const { data, error } = await sb.from('exercises').insert({ name: nx.name.trim(), muscle: nx.muscle.trim() || null, video_url: nx.video_url.trim() || null }).select('id, name, video_url').single()
    if (error || !data) return toast(error?.message ?? 'Errore')
    setNx({ name: '', muscle: '', video_url: '' }); add(data); router.refresh()
  }
  async function persist(asNew: boolean) {
    if (!name.trim() || !items.length) return toast('Scrivi un nome e aggiungi almeno un esercizio.')
    const inPlace = !!editId && !asNew
    const title = asNew && editId && name.trim() === workouts.find(w => w.id === editId)?.name ? `${name.trim()} (copia)` : name.trim()
    let wid = inPlace ? editId : null
    if (inPlace) {
      const { error } = await sb.from('workouts').update({ name: title }).eq('id', wid!)
      if (error) return toast(error.message)
    } else {
      const { data, error } = await sb.from('workouts').insert({ name: title }).select('id').single()
      if (error || !data) return toast(error?.message ?? 'Errore')
      wid = data.id
    }
    const rows = items.map((it, i) => ({ id: inPlace ? it.id : uid(), workout_id: wid, exercise_id: it.exercise_id, position: i, sets: it.sets, reps: it.reps, video_url: it.video_url.trim() || null }))
    const e2 = (await sb.from('workout_exercises').upsert(rows)).error
    if (e2) return toast(e2.message)
    if (inPlace) {
      const keep = items.map(i => i.id)
      const gone = (workouts.find(w => w.id === editId)?.workout_exercises ?? []).map(e => e.id).filter(id => !keep.includes(id))
      if (gone.length) { const e3 = (await sb.from('workout_exercises').delete().in('id', gone)).error; if (e3) return toast(e3.message) }
    }
    reset(); toast(`“${title}” salvato. Assegnalo a qualsiasi cliente da qui sotto.`); router.refresh()
  }
  async function assign() {
    if (!at || !ids.length) return
    const rows = ids.map(client_id => ({ workout_id: at.id, client_id, scheduled_on: date }))
    const { error } = await sb.from('assignments').upsert(rows, { onConflict: 'client_id,scheduled_on' })
    if (error) return toast(error.message)
    setSheet(null); setIds([])
    toast(`“${at.name}” assegnato a ${rows.length} ${rows.length > 1 ? 'clienti' : 'cliente'} per ${weekdayName(date).toLowerCase()}`)
    router.refresh()
  }

  return (
    <>
      <section className="card">
        <div className="eh"><h3>{editId ? 'Modifica allenamento' : 'Nuovo allenamento'}</h3>{editId && <button className="x" onClick={reset}>Annulla</button>}</div>
        <input className="tn" placeholder="Nome dell’allenamento, es. Giorno schiena" aria-label="Nome dell’allenamento" value={name} onChange={e => setName(e.target.value)} />
        {items.map((it, i) => (
          <div key={it.id} className="card" style={{ background: 'var(--bg)' }}>
            <div className="eh"><h3>{it.name}</h3><button className="x" onClick={() => setItems(items.filter((_, k) => k !== i))} aria-label={`Rimuovi ${it.name}`}>Rimuovi</button></div>
            <Stepper label="Serie" value={it.sets} onChange={d => patch(i, { sets: Math.max(1, it.sets + d) })} />
            <Stepper label="Rip." value={it.reps} onChange={d => patch(i, { reps: Math.max(1, it.reps + d) })} />
            <input className="mi" style={{ marginTop: 12 }} placeholder="Link video per questo esercizio" aria-label={`Link video: ${it.name}`} value={it.video_url} onChange={e => patch(i, { video_url: e.target.value })} />
          </div>
        ))}
        <button className="btn s" onClick={() => { setQ(''); setSheet('lib') }}>Aggiungi esercizio</button>
        <button className="btn" onClick={() => persist(false)}>{editId ? 'Aggiorna modello' : 'Salva modello'}</button>
        {editId && <button className="btn s" onClick={() => persist(true)}>Salva come nuova copia</button>}
      </section>

      <p className="mu" style={{ marginTop: 18 }}>{workouts.length} salvati · assegna ognuno a quanti clienti vuoi</p>
      {workouts.map(w => (
        <section key={w.id} className="card">
          <div className="eh"><h3>{w.name}</h3><span className="chip">{w.workout_exercises?.length ?? 0} esercizi</span></div>
          <p className="mu" style={{ marginTop: 4 }}>{[...w.workout_exercises].sort((a, b) => a.position - b.position).map(e => exName(e.exercise_id)).join(', ')}</p>
          <div className="g2">
            <button className="btn s" onClick={() => edit(w)}>Modifica</button>
            <button className="btn" onClick={() => { setAt(w); setIds([]); setSheet('wasg') }}>Assegna</button>
          </div>
        </section>
      ))}

      {sheet === 'lib' && (
        <Sheet onClose={() => setSheet(null)}>
          <h3>Aggiungi esercizio</h3>
          <input className="tn" placeholder="Cerca esercizi" aria-label="Cerca esercizi" value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn s" style={{ marginTop: 12 }} onClick={() => setSheet('new')}>Crea un nuovo esercizio</button>
          {shown.map(x => <button key={x.id} className="row" onClick={() => add(x)}><span style={{ flex: 1 }}><b>{x.name}</b><br /><span className="mu">{x.muscle}</span></span><b>+</b></button>)}
          {shown.length === 0 && <p className="mu" style={{ marginTop: 12 }}>Nessun risultato. Prova un gruppo muscolare, ad es. gambe.</p>}
        </Sheet>
      )}
      {sheet === 'new' && (
        <Sheet onClose={() => setSheet(null)}>
          <h3>Crea un nuovo esercizio</h3>
          <p className="mu">Entra nella tua libreria per tutti i prossimi allenamenti.</p>
          <input className="tn" placeholder="Nome dell’esercizio" aria-label="Nome dell’esercizio" value={nx.name} onChange={e => setNx({ ...nx, name: e.target.value })} />
          <input className="tn" placeholder="Gruppo muscolare, es. Petto" aria-label="Gruppo muscolare" value={nx.muscle} onChange={e => setNx({ ...nx, muscle: e.target.value })} />
          <input className="tn" placeholder="Link video (facoltativo)" aria-label="Link video" value={nx.video_url} onChange={e => setNx({ ...nx, video_url: e.target.value })} />
          <button className="btn" onClick={createEx}>Salva in libreria</button>
        </Sheet>
      )}
      {sheet === 'wasg' && at && (
        <Sheet onClose={() => setSheet(null)}>
          <h3>Assegna “{at.name}”</h3>
          <p className="mu">Scegli uno o più clienti, poi un giorno.</p>
          {clients.length === 0 && <p className="mu" style={{ marginTop: 12 }}>Nessun cliente ancora.</p>}
          {clients.map(c => (
            <button key={c.id} className="row" onClick={() => setIds(ids.includes(c.id) ? ids.filter(x => x !== c.id) : [...ids, c.id])}>
              <span className="av">{(c.full_name || '?')[0]}</span><b style={{ flex: 1 }}>{c.full_name || 'Senza nome'}</b>
              <span className={`ck${ids.includes(c.id) ? ' on' : ''}`}>✓</span>
            </button>
          ))}
          <DayPick value={date} onChange={setDate} />
          <button className="btn" disabled={!ids.length} onClick={assign}>{ids.length ? `Assegna a ${ids.length} ${ids.length > 1 ? 'clienti' : 'cliente'}` : 'Scegli un cliente'}</button>
        </Sheet>
      )}
    </>
  )
}
