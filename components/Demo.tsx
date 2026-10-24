'use client'
import { useState } from 'react'
import Sheet from '@/components/Sheet'

export default function Demo({ name, note, url }: { name: string; note?: string; url: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="chip vb" onClick={() => setOpen(true)}>Guarda demo</button>
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <h3>{name}</h3>
          <div className="vid"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
          {note && <p className="mu">{note}</p>}
          <a className="btn" href={url} target="_blank" rel="noopener">Apri il video dimostrativo</a>
        </Sheet>
      )}
    </>
  )
}
