import { IMG, ART } from '@/lib/images'

export default function Hero({ k, title, sub }: { k: string; title: string; sub?: string }) {
  const img = IMG[k]
  const bg = img ? `linear-gradient(180deg,rgba(10,14,22,.1),rgba(10,14,22,.75)),url(${img})` : `linear-gradient(135deg,${ART[k]})`
  return (
    <div className={`hero${img ? '' : ' ph'}`} style={{ backgroundImage: bg }}>
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {!img && process.env.NODE_ENV !== 'production' && <span className="tag">Spazio foto: {k}</span>}
    </div>
  )
}
