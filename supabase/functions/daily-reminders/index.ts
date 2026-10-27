// Run every morning by a scheduled job: reminds clients who have a workout today and have not started it.
import { admin, authorized, notify } from '../_shared/push.ts'

Deno.serve(async (req: Request) => {
  if (!authorized(req)) return new Response('unauthorized', { status: 401 })
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
  const { data } = await admin().from('assignments').select('client_id, workouts(name), set_logs(id)').eq('scheduled_on', today)
  // deno-lint-ignore no-explicit-any
  const todo = (data ?? []).filter((a: any) => !a.set_logs?.length)
  // deno-lint-ignore no-explicit-any
  await Promise.all(todo.map((a: any) => notify([a.client_id], 'Oggi ti alleni', `${a.workouts?.name ?? 'Il tuo allenamento'} ti aspetta.`, '/oggi')))
  return new Response(`sent ${todo.length}`)
})
