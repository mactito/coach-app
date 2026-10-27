// Sends push notifications: Android through Firebase Cloud Messaging, iPhone straight through Apple's APNs.
import { createClient } from 'npm:@supabase/supabase-js@2'

export const admin = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
export const authorized = (req: Request) => { const s = Deno.env.get('PUSH_WEBHOOK_SECRET'); return !!s && req.headers.get('x-webhook-secret') === s }

const enc = new TextEncoder()
const b64u = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const pemToDer = (pem: string) => Uint8Array.from(atob(pem.replace(/\\n/g, '\n').replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), c => c.charCodeAt(0))

export async function signJwt(header: object, claims: object, pem: string, alg: 'RS256' | 'ES256') {
  const input = `${b64u(enc.encode(JSON.stringify(header)))}.${b64u(enc.encode(JSON.stringify(claims)))}`
  const key = alg === 'RS256'
    ? await crypto.subtle.importKey('pkcs8', pemToDer(pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
    : await crypto.subtle.importKey('pkcs8', pemToDer(pem), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign(alg === 'RS256' ? 'RSASSA-PKCS1-v1_5' : { name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(input))
  return `${input}.${b64u(sig)}`
}

type Result = 'ok' | 'gone' | 'error'
let fcm: { token: string; project: string } | null = null
async function fcmAuth() {
  if (fcm) return fcm
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT')
  if (!raw) return null
  const sa = JSON.parse(raw), now = Math.floor(Date.now() / 1000)
  const jwt = await signJwt({ alg: 'RS256', typ: 'JWT' }, { iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }, sa.private_key, 'RS256')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) })
  const j = await r.json()
  if (!j.access_token) { console.error('FCM auth failed', j); return null }
  return (fcm = { token: j.access_token, project: sa.project_id })
}
async function sendAndroid(token: string, title: string, body: string, url: string): Promise<Result> {
  const a = await fcmAuth()
  if (!a) return 'error'
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${a.project}/messages:send`, {
    method: 'POST', headers: { authorization: `Bearer ${a.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ message: { token, notification: { title, body }, data: { url }, android: { priority: 'HIGH' } } }),
  })
  if (r.ok) return 'ok'
  const t = await r.text(); console.error('FCM', r.status, t)
  return r.status === 404 || t.includes('UNREGISTERED') ? 'gone' : 'error'
}

let apns: { jwt: string; at: number } | null = null
async function apnsJwt() {
  if (apns && Date.now() - apns.at < 45 * 60 * 1000) return apns.jwt
  const key = Deno.env.get('APNS_PRIVATE_KEY'), kid = Deno.env.get('APNS_KEY_ID'), team = Deno.env.get('APNS_TEAM_ID')
  if (!key || !kid || !team) return null
  const jwt = await signJwt({ alg: 'ES256', kid }, { iss: team, iat: Math.floor(Date.now() / 1000) }, key, 'ES256')
  apns = { jwt, at: Date.now() }
  return jwt
}
async function sendIos(token: string, title: string, body: string, url: string): Promise<Result> {
  const jwt = await apnsJwt()
  if (!jwt) return 'error'
  const host = Deno.env.get('APNS_ENV') === 'sandbox' ? 'api.sandbox.push.apple.com' : 'api.push.apple.com'
  const r = await fetch(`https://${host}/3/device/${token}`, {
    method: 'POST',
    headers: { authorization: `bearer ${jwt}`, 'apns-topic': Deno.env.get('APNS_BUNDLE_ID')!, 'apns-push-type': 'alert', 'apns-priority': '10', 'content-type': 'application/json' },
    body: JSON.stringify({ aps: { alert: { title, body }, sound: 'default' }, url }),
  })
  if (r.ok) return 'ok'
  const t = await r.text(); console.error('APNs', r.status, t)
  return r.status === 410 || t.includes('BadDeviceToken') || t.includes('Unregistered') ? 'gone' : 'error'
}

export async function notify(userIds: string[], title: string, body: string, url: string) {
  if (!userIds.length) return
  const db = admin()
  const { data } = await db.from('device_tokens').select('token, platform').in('user_id', userIds)
  const gone: string[] = []
  await Promise.all((data ?? []).map(async (d: { token: string; platform: string }) => {
    const r = d.platform === 'ios' ? await sendIos(d.token, title, body, url) : await sendAndroid(d.token, title, body, url)
    if (r === 'gone') gone.push(d.token)
  }))
  if (gone.length) await db.from('device_tokens').delete().in('token', gone)
}
