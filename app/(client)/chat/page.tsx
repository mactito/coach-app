import Chat from '@/components/Chat'
import { requireRole } from '@/lib/auth'

export default async function ClientChat() {
  const { sb, user } = await requireRole('client')
  const { data } = await sb.from('messages').select('id, sender_id, body, created_at').eq('client_id', user.id).order('created_at').limit(300)
  return (
    <>
      <div className="chh"><div className="eh" style={{ justifyContent: 'flex-start', gap: 12 }}><span className="av">R</span><div><h3>Coach Raphi</h3><p className="mu">Chiedi pure, ti risponde appena può</p></div></div></div>
      <Chat clientId={user.id} meId={user.id} initial={data ?? []} />
    </>
  )
}
