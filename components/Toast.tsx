'use client'
import { useEffect, useRef, useState } from 'react'

export default function Toast() {
  const [m, setM] = useState('')
  const [on, setOn] = useState(false)
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    const h = (e: Event) => { setM((e as CustomEvent<string>).detail); setOn(true); clearTimeout(t.current); t.current = setTimeout(() => setOn(false), 2300) }
    window.addEventListener('toast', h)
    return () => window.removeEventListener('toast', h)
  }, [])
  return <div id="toast" role="status" className={on ? 'on' : ''}>{m}</div>
}
