import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email confirmation links land here, then the user is sent into the app.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (code) {
    const sb = await createClient()
    await sb.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL('/', url.origin))
}
