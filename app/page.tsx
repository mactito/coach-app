import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'

export default async function Home() {
  const sb = await createClient()
  const id = await getUserId()
  if (!id) redirect('/login')
  const { data: me } = await sb.from('profiles').select('role').eq('id', id).single()
  redirect(me?.role === 'trainer' ? '/trainer' : '/oggi')
}
