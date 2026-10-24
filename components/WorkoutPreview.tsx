import Demo from '@/components/Demo'

export type WE = { id: string; exercise_id: string; position: number; sets: number; reps: number; video_url: string | null; exercises: { name: string; video_url: string | null } }

export default function WorkoutPreview({ list }: { list: WE[] }) {
  return (
    <>
      {list.map(e => {
        const v = e.video_url || e.exercises.video_url
        return (
          <section key={e.id} className="card">
            <div className="eh"><h3>{e.exercises.name}</h3>{v && <Demo name={e.exercises.name} url={v} />}</div>
            <p className="mu">{e.sets} serie da {e.reps} ripetizioni</p>
          </section>
        )
      })}
    </>
  )
}
