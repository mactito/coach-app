'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { registerPush } from '@/lib/push'

export default function PushInit() {
  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(({ data }) => { if (data.session) void registerPush() })
    const { data: sub } = sb.auth.onAuthStateChange(e => { if (e === 'SIGNED_IN') void registerPush() })
    return () => sub.subscription.unsubscribe()
  }, [])
  return null
}
