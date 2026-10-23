import Shell, { clientLinks } from '@/components/Shell'
import Chat from '@/components/Chat'
import { requireRole } from '@/lib/auth'

export default async function ClientChat() {
  const { sb, user } = await requireRole('client')
  const { data } = await sb.from('messages').select('id, sender_id, body, created_at').eq('client_id', user.id).order('created_at').limit(300)
  return (
    <Shell links={clientLinks} chat>
      <div className="chh"><h3>Coach Raphi</h3><p className="mu">Scrivi qui domande e commenti sugli allenamenti.</p></div>
      <Chat clientId={user.id} meId={user.id} initial={data ?? []} />
    </Shell>
  )
}
