import Link from 'next/link'
import { notFound } from 'next/navigation'
import Chat from '@/components/Chat'
import { requireRole } from '@/lib/auth'

export default async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sb, user } = await requireRole('trainer')
  const { data: c } = await sb.from('profiles').select('full_name').eq('id', id).eq('role', 'client').single()
  if (!c) notFound()
  const { data } = await sb.from('messages').select('id, sender_id, body, created_at').eq('client_id', id).order('created_at').limit(300)
  return (
    <>
      <div className="chh"><Link className="back" href="/trainer/chat">‹ Messaggi</Link><div className="eh" style={{ justifyContent: 'flex-start', gap: 12 }}><span className="av">{(c.full_name || '?')[0]}</span><div><h3>{c.full_name || 'Senza nome'}</h3><p className="mu">Messaggi in app</p></div></div></div>
      <Chat clientId={id} meId={user.id} initial={data ?? []} />
    </>
  )
}
