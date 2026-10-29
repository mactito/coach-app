import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export { todayRome } from '@/lib/dates'

// Reads the user id from the signed session token (no round trip to the auth server).
export const getUserId = cache(async () => {
  const sb = await createClient()
  const { data } = await sb.auth.getClaims()
  return (data?.claims?.sub as string | undefined) ?? null
})

export async function requireRole(role: 'trainer' | 'client') {
  const sb = await createClient()
  const id = await getUserId()
  if (!id) redirect('/login')
  const { data: me } = await sb.from('profiles').select('role, consented_at, onboarded_at').eq('id', id).single()
  if (!me) redirect('/login')
  if (me.role !== role) redirect(me.role === 'trainer' ? '/trainer' : '/oggi')
  if (role === 'client' && !me.consented_at) redirect('/consenso')
  if (role === 'client' && !me.onboarded_at) redirect('/benvenuto')
  return { sb, user: { id } }
}
