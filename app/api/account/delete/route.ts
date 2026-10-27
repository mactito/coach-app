import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Lets a client permanently delete their own account and data (required by Apple and Google).
export async function POST() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { data: me } = await sb.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'client') return NextResponse.json({ error: 'L’account del trainer non si elimina da qui. Scrivi al supporto.' }, { status: 403 })
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return NextResponse.json({ error: 'Configurazione mancante sul server.' }, { status: 500 })

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } })
  const { data: files } = await admin.storage.from('checkins').list(user.id, { limit: 1000 })
  if (files?.length) await admin.storage.from('checkins').remove(files.map(f => `${user.id}/${f.name}`))
  const { error } = await admin.auth.admin.deleteUser(user.id) // profile and all linked data are removed by the database
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await sb.auth.signOut()
  return NextResponse.json({ ok: true })
}
