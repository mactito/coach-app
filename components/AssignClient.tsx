'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sheet from '@/components/Sheet'
import DayPick from '@/components/DayPick'
import { toast } from '@/lib/toast'
import { todayRome, weekdayName } from '@/lib/dates'

export default function AssignClient({ clientId, clientName, workouts }: { clientId: string; clientName: string; workouts: { id: string; name: string }[] }) {
  const sb = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(todayRome())

  async function give(w: { id: string; name: string }) {
    const { error } = await sb.from('assignments').upsert({ workout_id: w.id, client_id: clientId, scheduled_on: date }, { onConflict: 'client_id,scheduled_on' })
    if (error) return toast(error.message)
    setOpen(false)
    toast(`“${w.name}” assegnato a ${clientName} per ${weekdayName(date).toLowerCase()}`)
    router.refresh()
  }
  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>Assegna allenamento</button>
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <h3>Assegna a {clientName}</h3>
          <p className="mu">Scegli un giorno, poi un allenamento.</p>
          <DayPick value={date} onChange={setDate} />
          {workouts.length === 0 && <p className="mu" style={{ marginTop: 12 }}>Nessun allenamento salvato. Creane uno dalla scheda Allenamenti.</p>}
          {workouts.map(w => <button key={w.id} className="row" onClick={() => give(w)}><b style={{ flex: 1 }}>{w.name}</b><b>+</b></button>)}
        </Sheet>
      )}
    </>
  )
}
