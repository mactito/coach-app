export type WE = { id: string; position: number; sets: number; reps: number; video_url: string | null; exercises: { name: string; video_url: string | null } }

export default function WorkoutPreview({ list }: { list: WE[] }) {
  return (
    <>
      {list.map(e => {
        const v = e.video_url || e.exercises.video_url
        return (
          <section key={e.id} className="card">
            <div className="eh"><h3>{e.exercises.name}</h3>{v && <a className="chip vb" style={{ textDecoration: 'none' }} href={v} target="_blank" rel="noopener">Guarda demo</a>}</div>
            <p className="mu">{e.sets} serie da {e.reps} ripetizioni</p>
          </section>
        )
      })}
    </>
  )
}
