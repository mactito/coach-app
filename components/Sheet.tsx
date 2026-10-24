'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// Bottom sheet that slides over the phone frame, like in the prototype.
export default function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const [el, setEl] = useState<Element | null>(null)
  useEffect(() => setEl(document.querySelector('.phone')), [])
  if (!el) return null
  return createPortal(<div className="bd" onClick={onClose}><div className="sh" onClick={e => e.stopPropagation()}>{children}</div></div>, el)
}
