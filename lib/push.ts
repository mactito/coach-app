import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

const KEY = 'push_token'
let started = false

// Inside the iOS / Android app only: ask permission, get this phone's token and save it for the signed-in user.
export async function registerPush() {
  if (started) return
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    started = true
    const { PushNotifications } = await import('@capacitor/push-notifications')
    let perm = await PushNotifications.checkPermissions()
    if (perm.receive === 'prompt') perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') { started = false; return }
    await PushNotifications.removeAllListeners()
    await PushNotifications.addListener('registration', async t => {
      localStorage.setItem(KEY, t.value)
      await createClient().rpc('register_device', { p_token: t.value, p_platform: Capacitor.getPlatform() })
    })
    await PushNotifications.addListener('pushNotificationReceived', n => toast(`${n.title ?? ''}${n.body ? ': ' + n.body : ''}`))
    await PushNotifications.addListener('pushNotificationActionPerformed', a => {
      const url = (a.notification.data as { url?: string } | undefined)?.url
      if (url && url.startsWith('/')) window.location.href = url
    })
    await PushNotifications.register()
  } catch { started = false }
}

// Called on log out so the next person on this phone does not receive this user's notifications.
export async function unregisterPush() {
  try {
    const t = localStorage.getItem(KEY)
    if (t) await createClient().rpc('unregister_device', { p_token: t })
    localStorage.removeItem(KEY)
  } catch {}
  started = false
}
