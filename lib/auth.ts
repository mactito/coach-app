import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const todayRome = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

export async function requireRole(role: 'trainer' | 'client') {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await sb.from('profiles').select('role, consented_at').eq('id', user.id).single()
  if (!me) redirect('/login')
  if (me.role !== role) redirect(me.role === 'trainer' ? '/trainer' : '/oggi')
  if (role === 'client' && !me.consented_at) redirect('/consenso')
  return { sb, user }
}
