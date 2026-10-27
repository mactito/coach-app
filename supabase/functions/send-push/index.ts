// Called by a Database Webhook every time a row is inserted into `messages`.
import { admin, authorized, notify } from '../_shared/push.ts'

Deno.serve(async (req: Request) => {
  if (!authorized(req)) return new Response('unauthorized', { status: 401 })
  const { record } = await req.json()
  if (!record?.client_id) return new Response('ignored')
  const db = admin()
  const text = String(record.body).replace(/^Dopo l’allenamento · /, 'Commento: ').slice(0, 140)
  if (record.sender_id === record.client_id) {
    // a client wrote: tell the trainer(s)
    const [c, t] = await Promise.all([
      db.from('profiles').select('full_name').eq('id', record.client_id).single(),
      db.from('profiles').select('id').eq('role', 'trainer'),
    ])
    await notify((t.data ?? []).map((x: { id: string }) => x.id), c.data?.full_name || 'Nuovo messaggio', text, `/trainer/chat/${record.client_id}`)
  } else {
    // the trainer wrote: tell the client
    await notify([record.client_id], 'Coach Raphi', text, '/chat')
  }
  return new Response('ok')
})
