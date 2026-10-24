'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const GOALS = ['Perdere peso', 'Aumentare la massa muscolare', 'Tonificare il corpo', 'Migliorare la resistenza', 'Stare in salute']
const LEVELS = ['Principiante', 'Intermedio', 'Avanzato']

export default function Benvenuto() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ age: '', weight: '', height: '', goal: '', level: '', days: 3, limits: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (p: Partial<typeof f>) => setF({ ...f, ...p })
  const num = (s: string) => Number(s.replace(',', '.'))

  function next() {
    setErr('')
    if (step === 0) {
      if (!(num(f.age) >= 10 && num(f.age) <= 100)) return setErr('Scrivi la tua età (da 10 a 100 anni).')
      if (!(num(f.weight) >= 25 && num(f.weight) <= 300)) return setErr('Scrivi il tuo peso in kg.')
      if (!(num(f.height) >= 100 && num(f.height) <= 250)) return setErr('Scrivi la tua altezza in cm.')
    }
    if (step === 1 && (!f.goal || !f.level)) return setErr('Scegli un obiettivo e il tuo livello.')
    if (step < 2) return setStep(step + 1)
    void save()
  }
  async function save() {
    setBusy(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return router.push('/login')
    const e1 = (await sb.from('client_profiles').upsert({
      client_id: user.id, age: Math.round(num(f.age)), weight_kg: num(f.weight), height_cm: Math.round(num(f.height)),
      goal: f.goal, experience: f.level, days_per_week: f.days, limitations: f.limits.trim() || null, updated_at: new Date().toISOString(),
    })).error
    if (e1) { setBusy(false); return setErr(e1.message) }
    const e2 = (await sb.from('profiles').update({ onboarded_at: new Date().toISOString() }).eq('id', user.id)).error
    if (e2) { setBusy(false); return setErr(e2.message) }
    router.push('/'); router.refresh()
  }

  return (
    <div className="scr">
      <div className="prog" style={{ marginTop: 8 }}><div className="bar a"><i style={{ width: `${((step + 1) / 3) * 100}%` }} /></div><span>Passo {step + 1} di 3</span></div>
      {step === 0 && (
        <>
          <h1 style={{ marginTop: 22 }}>Parlaci di te</h1>
          <p className="mu">Raphi li usa per costruire un programma su misura.</p>
          <input className="tn" inputMode="numeric" placeholder="Età (anni)" aria-label="Età" value={f.age} onChange={e => set({ age: e.target.value })} />
          <input className="tn" inputMode="decimal" placeholder="Peso (kg)" aria-label="Peso in chilogrammi" value={f.weight} onChange={e => set({ weight: e.target.value })} />
          <input className="tn" inputMode="numeric" placeholder="Altezza (cm)" aria-label="Altezza in centimetri" value={f.height} onChange={e => set({ height: e.target.value })} />
        </>
      )}
      {step === 1 && (
        <>
          <h1 style={{ marginTop: 22 }}>Il tuo obiettivo</h1>
          <p className="mu">Cosa vuoi ottenere?</p>
          {GOALS.map(g => (
            <button key={g} className="row" onClick={() => set({ goal: g })}><b style={{ flex: 1 }}>{g}</b><span className={`ck${f.goal === g ? ' on' : ''}`}>✓</span></button>
          ))}
          <h3 style={{ marginTop: 22 }}>Il tuo livello</h3>
          <div className="dys" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{LEVELS.map(l => <button key={l} className={f.level === l ? 'on' : ''} onClick={() => set({ level: l })}>{l}</button>)}</div>
          <h3 style={{ marginTop: 22 }}>Giorni di allenamento a settimana</h3>
          <div className="dys">{[1, 2, 3, 4, 5, 6, 7].map(d => <button key={d} className={f.days === d ? 'on' : ''} onClick={() => set({ days: d })}>{d}</button>)}</div>
        </>
      )}
      {step === 2 && (
        <>
          <h1 style={{ marginTop: 22 }}>Un’ultima cosa</h1>
          <p className="mu">Hai infortuni, dolori o limitazioni di cui Raphi deve tenere conto? Puoi anche lasciare vuoto.</p>
          <textarea className="tn" rows={5} style={{ height: 'auto', padding: '10px 12px' }} placeholder="Scrivi qui…" aria-label="Infortuni o limitazioni" value={f.limits} onChange={e => set({ limits: e.target.value })} />
        </>
      )}
      {err && <p className="err">{err}</p>}
      <button className="btn" disabled={busy} onClick={next}>{step < 2 ? 'Continua' : busy ? 'Salvataggio…' : 'Inizia'}</button>
      {step > 0 && <button className="back" style={{ marginTop: 10 }} onClick={() => { setStep(step - 1); setErr('') }}>‹ Indietro</button>}
    </div>
  )
}
