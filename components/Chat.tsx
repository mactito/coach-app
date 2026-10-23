'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Msg = { id: string; sender_id: string; body: string; created_at: string }
const when = (s: string) => new Date(s).toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

export default function Chat({ clientId, meId, initial }: { clientId: string; meId: string; initial: Msg[] }) {
  const sb = createClient()
  const [msgs, setMsgs] = useState<Msg[]>(initial)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const add = (m: Msg) => setMsgs(p => (p.some(x => x.id === m.id) ? p : [...p, m]))

  useEffect(() => {
    const ch = sb
      .channel('chat-' + clientId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `client_id=eq.${clientId}` }, p => add(p.new as Msg))
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [clientId])
  useEffect(() => { end.current?.scrollIntoView() }, [msgs.length])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText(''); setErr('')
    const { data, error } = await sb.from('messages').insert({ client_id: clientId, body }).select('id, sender_id, body, created_at').single()
    if (error) { setErr(error.message); setText(body); return }
    add(data as Msg)
  }

  return (
    <>
      <div className="th">
        {msgs.length === 0 && <p className="mu">Nessun messaggio ancora. Scrivi per primo.</p>}
        {msgs.map(m => (
          <div key={m.id} className={`bb${m.sender_id === meId ? ' me' : ''}`}><p>{m.body}</p><small>{when(m.created_at)}</small></div>
        ))}
        <div ref={end} />
      </div>
      {err && <p className="err">{err}</p>}
      <form className="cb" onSubmit={send}>
        <input placeholder="Scrivi un messaggio" aria-label="Messaggio" value={text} onChange={e => setText(e.target.value)} maxLength={2000} autoComplete="off" />
        <button className="btn" type="submit">Invia</button>
      </form>
    </>
  )
}
