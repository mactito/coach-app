'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sheet from '@/components/Sheet'
import { toast } from '@/lib/toast'

export type LibEx = { id: string; name: string; muscle: string | null; video_url: string | null }

export default function ExercisePicker({ library, onPick, onClose }: { library: LibEx[]; onPick: (x: LibEx) => void; onClose: () => void }) {
  const sb = createClient()
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [nx, setNx] = useState({ name: '', muscle: '', video_url: '' })
  const shown = library.filter(e => (e.name + (e.muscle ?? '')).toLowerCase().includes(q.toLowerCase()))

  async function create() {
    if (!nx.name.trim()) return toast('Dai un nome all’esercizio prima di salvare')
    const { data, error } = await sb.from('exercises').insert({ name: nx.name.trim(), muscle: nx.muscle.trim() || null, video_url: nx.video_url.trim() || null }).select('id, name, muscle, video_url').single()
    if (error || !data) return toast(error?.message ?? 'Errore')
    onPick(data as LibEx)
  }
  return (
    <Sheet onClose={onClose}>
      {creating ? (
        <>
          <h3>Crea un nuovo esercizio</h3>
          <p className="mu">Entra nella tua libreria per tutti i prossimi allenamenti.</p>
          <input className="tn" placeholder="Nome dell’esercizio" aria-label="Nome dell’esercizio" value={nx.name} onChange={e => setNx({ ...nx, name: e.target.value })} />
          <input className="tn" placeholder="Gruppo muscolare, es. Petto" aria-label="Gruppo muscolare" value={nx.muscle} onChange={e => setNx({ ...nx, muscle: e.target.value })} />
          <input className="tn" placeholder="Link video (facoltativo)" aria-label="Link video" value={nx.video_url} onChange={e => setNx({ ...nx, video_url: e.target.value })} />
          <button className="btn" onClick={create}>Salva in libreria e aggiungi</button>
          <button className="btn s" onClick={() => setCreating(false)}>Indietro</button>
        </>
      ) : (
        <>
          <h3>Aggiungi esercizio</h3>
          <input className="tn" placeholder="Cerca esercizi" aria-label="Cerca esercizi" value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn s" style={{ marginTop: 12 }} onClick={() => setCreating(true)}>Crea un nuovo esercizio</button>
          {shown.map(x => <button key={x.id} className="row" onClick={() => onPick(x)}><span style={{ flex: 1 }}><b>{x.name}</b><br /><span className="mu">{x.muscle}</span></span><b>+</b></button>)}
          {shown.length === 0 && <p className="mu" style={{ marginTop: 12 }}>Nessun risultato. Prova un gruppo muscolare, ad es. gambe.</p>}
        </>
      )}
    </Sheet>
  )
}
