'use client'
import Link from 'next/link'
import { useState } from 'react'

export type Row = { id: string; name: string; ok: boolean; sub: string; dots: string }
const GR = ['#3B4CCA,#7A4FD6', '#C2410C,#7A4FD6', '#0E9F77,#2B3A8F', '#2B3A8F,#1B2433']

export default function ClientGrid({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState('')
  const [f, setF] = useState(0)
  const chips = [['Tutti', rows.length], ['Da sentire', rows.filter(r => !r.ok).length], ['In regola', rows.filter(r => r.ok).length]] as const
  const shown = rows.filter(r => (f === 0 || (f === 1 ? !r.ok : r.ok)) && r.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <input className="tn" placeholder="Cerca un cliente" aria-label="Cerca un cliente" value={q} onChange={e => setQ(e.target.value)} />
      <div className="dys" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {chips.map(([n, c], i) => <button key={n} className={i === f ? 'on' : ''} onClick={() => setF(i)}>{n} ({c})</button>)}
      </div>
      <div className="cg">
        {shown.length === 0 && <p className="mu" style={{ gridColumn: '1/-1' }}>Nessun cliente trovato.</p>}
        {shown.map(r => (
          <Link key={r.id} href={`/trainer/clients/${r.id}`} className="cc" style={{ backgroundImage: `linear-gradient(135deg,${GR[rows.indexOf(r) % GR.length]})` }}>
            <span className="ini">{r.name[0]}</span>
            <span className={`chip cst${r.ok ? '' : ' w'}`}>{r.ok ? 'In regola' : 'Da sentire'}</span>
            <span className="in"><b>{r.name}</b><span className="sm">{r.sub}</span><span className="dots">{r.dots.split('').map((c, i) => <i key={i} className={c} />)}</span></span>
          </Link>
        ))}
      </div>
    </>
  )
}
