import type { SupabaseClient } from '@supabase/supabase-js'
import { todayRome, weekDates } from '@/lib/dates'

export type Session = { id: string; date: string; name: string; done: number; total: number }

export async function loadSessions(sb: SupabaseClient, clientIds: string[], days = 70) {
  const out = new Map<string, Session[]>()
  clientIds.forEach(id => out.set(id, []))
  if (!clientIds.length) return out
  const from = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10)
  const { data: as } = await sb.from('assignments')
    .select('id, client_id, scheduled_on, workouts(name, workout_exercises(sets))')
    .in('client_id', clientIds).gte('scheduled_on', from).order('scheduled_on')
  const ids = (as ?? []).map((a: any) => a.id as string)
  const { data: logs } = ids.length ? await sb.from('set_logs').select('assignment_id').in('assignment_id', ids).limit(5000) : { data: [] as any[] }
  const cnt = new Map<string, number>()
  ;(logs ?? []).forEach((l: any) => cnt.set(l.assignment_id, (cnt.get(l.assignment_id) ?? 0) + 1))
  ;(as ?? []).forEach((a: any) => {
    const w = a.workouts
    out.get(a.client_id)?.push({
      id: a.id, date: a.scheduled_on, name: w?.name ?? '', done: cnt.get(a.id) ?? 0,
      total: (w?.workout_exercises ?? []).reduce((s: number, e: any) => s + e.sets, 0),
    })
  })
  return out
}

// d = done, m = missed, p = planned, r = rest (one letter per day, Monday first)
export const weekDots = (ss: Session[]) => {
  const today = todayRome()
  return weekDates().map(d => { const s = ss.find(x => x.date === d); return !s ? 'r' : s.done > 0 ? 'd' : d < today ? 'm' : 'p' }).join('')
}
export function statusOf(ss: Session[]) {
  const today = todayRome(), from = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
  const missed = ss.filter(s => s.date >= from && s.date < today && s.done === 0).length
  return { ok: missed === 0, missed }
}

export async function loadLift(sb: SupabaseClient, clientId: string) {
  const { data } = await sb.from('set_logs')
    .select('kg, assignments!inner(client_id, scheduled_on), workout_exercises(exercises(name))')
    .eq('assignments.client_id', clientId).not('kg', 'is', null).limit(3000)
  const byEx = new Map<string, Map<string, number>>()
  ;(data ?? []).forEach((r: any) => {
    const n = r.workout_exercises?.exercises?.name, d = r.assignments?.scheduled_on
    if (!n || !d) return
    const m = byEx.get(n) ?? new Map<string, number>()
    m.set(d, Math.max(m.get(d) ?? 0, Number(r.kg))); byEx.set(n, m)
  })
  let name = '', best: Map<string, number> | null = null
  for (const [n, m] of byEx) if (!best || m.size > best.size) { name = n; best = m }
  if (!best) return null
  const points = [...best.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-8).map(x => x[1])
  return { lift: name, points }
}

export async function latestPhotos(sb: SupabaseClient, clientId: string) {
  const { data } = await sb.from('checkin_photos').select('kind, path, created_at').eq('client_id', clientId).order('created_at', { ascending: false }).limit(20)
  const out: Record<string, { url: string; at: string } | null> = { before: null, after: null }
  for (const k of ['before', 'after']) {
    const r = (data ?? []).find((x: any) => x.kind === k)
    if (!r) continue
    const { data: s } = await sb.storage.from('checkins').createSignedUrl(r.path, 3600)
    if (s) out[k] = { url: s.signedUrl, at: r.created_at }
  }
  return out
}
