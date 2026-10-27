'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { unregisterPush } from '@/lib/push'

export default function LogoutButton() {
  const router = useRouter()
  async function go() {
    await unregisterPush()
    await createClient().auth.signOut()
    router.push('/login'); router.refresh()
  }
  return <button className="back" onClick={go}>Esci</button>
}
