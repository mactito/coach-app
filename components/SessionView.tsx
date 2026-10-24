export type SLog = { workout_exercise_id: string; set_no: number; kg: number | null; reps: number | null }
export type SEx = { id: string; sets: number; reps: number; exercises: { name: string } }

// Read-only view of a session: what the client planned and what they actually logged.
export default function SessionView({ list, logs }: { list: SEx[]; logs: SLog[] }) {
  return (
    <>
      {list.map(e => {
        const mine = logs.filter(l => l.workout_exercise_id === e.id)
        return (
          <section key={e.id} className="card">
            <div className="eh"><h3>{e.exercises.name}</h3><span className={`chip${mine.length === 0 ? ' w' : ''}`}>{mine.length}/{e.sets} serie</span></div>
            <p className="mu">{e.sets} serie da {e.reps} ripetizioni</p>
            {Array.from({ length: e.sets }, (_, i) => i + 1).map(n => {
              const l = mine.find(x => x.set_no === n)
              return <div key={n} className="lr"><span>Serie {n}</span>{l ? <b>{l.kg ?? '—'} kg × {l.reps ?? '—'}</b> : <span className="mu">non fatta</span>}</div>
            })}
          </section>
        )
      })}
    </>
  )
}
