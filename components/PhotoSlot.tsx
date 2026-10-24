'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

export default function PhotoSlot({ kind, label, url, at, userId }: { kind: 'before' | 'after'; label: string; url?: string; at?: string; userId: string }) {
  const sb = createClient()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) return setErr('La foto è troppo grande (massimo 10 MB).')
    setBusy(true); setErr('')
    const ext = (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${userId}/${kind}-${Date.now()}.${ext}`
    const up = await sb.storage.from('checkins').upload(path, f, { contentType: f.type })
    if (up.error) { setBusy(false); return setErr(up.error.message) }
    const ins = await sb.from('checkin_photos').insert({ kind, path })
    setBusy(false)
    if (ins.error) return setErr(ins.error.message)
    toast('Foto salvata. Coach Raphi la vede nel tuo profilo.')
    router.refresh()
  }

  return (
    <div>
      <label className={`slot${url ? ' has' : ''}`}>
        {url ? <img src={url} alt={label} /> : <span className="ph0">{busy ? 'Caricamento…' : 'Aggiungi foto'}</span>}
        <input type="file" accept="image/*" onChange={pick} disabled={busy} aria-label={`${label}: scegli una foto`} />
        <span className="sl"><b>{label}</b><br />{busy ? 'Caricamento…' : at ? `Aggiunta il ${new Date(at).toLocaleDateString('it-IT')}` : 'Tocca per scegliere'}</span>
      </label>
      {err && <p className="err">{err}</p>}
    </div>
  )
}
