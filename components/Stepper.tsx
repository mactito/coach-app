'use client'
export default function Stepper({ label, value, onChange }: { label: string; value: number | string; onChange: (dir: 1 | -1) => void }) {
  return (
    <div className="srow">
      <span>{label}</span>
      <div className="stp">
        <button onClick={() => onChange(-1)} aria-label={`Diminuisci: ${label}`}>−</button>
        <b>{value}</b>
        <button onClick={() => onChange(1)} aria-label={`Aumenta: ${label}`}>+</button>
      </div>
    </div>
  )
}
