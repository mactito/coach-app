'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

export default function DeleteAccount() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [word, setWord] = useState('')
  const [busy, setBusy] = useState(false)

  async function go() {
    setBusy(true)
    const res = await fetch('/api/account/delete', { method: 'POST' })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) { setBusy(false); return toast(j.error ?? 'Non è stato possibile eliminare l’account.') }
    await createClient().auth.signOut()
    router.push('/login'); router.refresh()
  }
  return (
    <>
      {!open ? <button className="btn s" style={{ color: 'var(--wn)' }} onClick={() => setOpen(true)}>Elimina il mio account</button> : (
        <section className="card">
          <h3>Eliminare l’account?</h3>
          <p className="mu" style={{ marginTop: 6 }}>È definitivo. Verranno cancellati profilo, questionario, allenamenti registrati, foto, messaggi e piano alimentare.</p>
          <input className="tn" placeholder="Scrivi ELIMINA per confermare" aria-label="Conferma eliminazione" value={word} onChange={e => setWord(e.target.value)} />
          <button className="btn" style={{ background: 'var(--wn)' }} disabled={word.trim().toUpperCase() !== 'ELIMINA' || busy} onClick={go}>{busy ? 'Eliminazione…' : 'Elimina per sempre'}</button>
          <button className="btn s" onClick={() => { setOpen(false); setWord('') }}>Annulla</button>
        </section>
      )}
    </>
  )
}
