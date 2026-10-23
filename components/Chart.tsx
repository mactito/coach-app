export default function Chart({ points, label }: { points: number[]; label: string }) {
  if (points.length < 2) return <p className="mu" style={{ marginTop: 10 }}>Il grafico appare dopo almeno due allenamenti con il peso registrato.</p>
  const mn = Math.min(...points) - 2.5, mx = Math.max(...points) + 2.5, L = points.length - 1
  const x = (i: number) => 20 + (i * 280) / L, y = (v: number) => 120 - ((v - mn) / (mx - mn)) * 100
  const f = (v: number) => String(v).replace('.', ',')
  return (
    <svg viewBox="0 0 320 140" width="100%" role="img" aria-label={`${label}: da ${f(points[0])} a ${f(points[L])} kg`} style={{ marginTop: 8 }}>
      <polyline points={points.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="var(--ac)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === L ? 5 : 3.5} fill={i === L ? 'var(--ac)' : 'var(--sf)'} stroke="var(--ac)" strokeWidth="2" />)}
      <text x={x(L)} y={y(points[L]) - 12} textAnchor="end" fill="var(--ink)" fontSize="12" fontWeight="700">{f(points[L])} kg</text>
    </svg>
  )
}
