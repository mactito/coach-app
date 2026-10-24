export const todayRome = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

// Monday to Sunday of the current week (Italian time), as YYYY-MM-DD
export function weekDates(base?: string): string[] {
  const now = base ? new Date(base + 'T12:00:00') : new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d.toLocaleDateString('sv-SE') })
}
export const fmtDay = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
export const weekdayName = (d: string) => { const s = new Date(d + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long' }); return s[0].toUpperCase() + s.slice(1) }
export const addDays = (d: string, n: number) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('sv-SE') }
export const fmtShort = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
