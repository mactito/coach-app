import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return new NextResponse('Configurazione mancante: aggiungi NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nelle variabili d’ambiente di Vercel, poi fai un nuovo deploy.', { status: 500 })
  }
  let res = NextResponse.next({ request: req })
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value))
        res = NextResponse.next({ request: req })
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
      },
    },
  })
  let signedIn = false
  try { signedIn = !!(await sb.auth.getClaims()).data?.claims } catch { return res }
  const open = ['/login', '/auth', '/privacy', '/supporto'].some(x => req.nextUrl.pathname.startsWith(x))
  if (!signedIn && !open) return NextResponse.redirect(new URL('/login', req.url))
  return res
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'] }
