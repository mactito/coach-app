'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// IMPORTANT: replace the bracketed parts and have a lawyer approve this text before real clients use the app.
export default function Consenso() {
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')

  async function accept() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return router.push('/login')
    const { error } = await sb.from('profiles').update({ consented_at: new Date().toISOString() }).eq('id', user.id)
    if (error) return setErr(error.message)
    router.push('/'); router.refresh()
  }

  return (
    <div className="scr">
      <h1>La tua privacy</h1>
      <p className="mu">Prima di iniziare, leggi come usiamo i tuoi dati.</p>
      <section className="card">
        <p style={{ margin: 0 }}>
          Il titolare del trattamento è [NOME E COGNOME / RAGIONE SOCIALE DI RAPHI]. Tratta i tuoi dati (nome, email, allenamenti, piano alimentare e messaggi) per seguirti nel tuo percorso di allenamento.
          Questi dati possono riguardare la tua salute: li usiamo solo con il tuo consenso e non li vendiamo né li condividiamo con terzi, a parte i fornitori tecnici che ospitano l’app.
          Puoi chiedere in qualsiasi momento di accedere ai tuoi dati, correggerli o cancellarli, e puoi revocare il consenso scrivendo a [EMAIL DI CONTATTO].
        </p>
      </section>
      <label className="row">
        <input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} />
        <span>Ho letto l’informativa e acconsento al trattamento dei miei dati, anche relativi alla salute.</span>
      </label>
      <button className="btn" disabled={!ok} onClick={accept}>Continua</button>
      <p className="mu" style={{ marginTop: 10 }}>Leggi l’<a href="/privacy" style={{ color: 'var(--ac)' }}>informativa completa</a>.</p>
      {err && <p className="err">{err}</p>}
      <a className="back" style={{ marginTop: 14 }} href="/impostazioni">Non voglio continuare: gestisci o elimina il mio account</a>
    </div>
  )
}
