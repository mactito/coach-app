'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const router = useRouter()
  const [signup, setSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    const sb = createClient()
    const { data, error } = signup
      ? await sb.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` } })
      : await sb.auth.signInWithPassword({ email, password })
    if (error) return setMsg(error.message)
    if (!data.session) return setMsg('Controlla la tua email per confermare l’account.')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="scr">
      <h1 style={{ marginTop: 40 }}>Coach Raphi</h1>
      <p className="mu">Allenamenti, pasti e progressi in un unico posto.</p>
      <form onSubmit={submit}>
        {signup && <input className="tn" placeholder="Nome e cognome" value={name} onChange={e => setName(e.target.value)} required />}
        <input className="tn" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="tn" type="password" placeholder="Password (min. 6 caratteri)" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn" type="submit">{signup ? 'Crea account' : 'Accedi'}</button>
      </form>
      <button className="back" style={{ marginTop: 14 }} onClick={() => { setSignup(!signup); setMsg('') }}>
        {signup ? 'Hai già un account? Accedi' : 'Sei un nuovo cliente? Registrati'}
      </button>
      {msg && <p className="err">{msg}</p>}
    </div>
  )
}
