export default function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Caricamento">
      <div className="sk" style={{ height: 28, width: '55%', marginTop: 8 }} />
      <div className="sk" style={{ height: 14, width: '35%', marginTop: 10 }} />
      <div className="sk" style={{ height: 120, marginTop: 20 }} />
      <div className="sk" style={{ height: 90, marginTop: 14 }} />
      <div className="sk" style={{ height: 90, marginTop: 14 }} />
    </div>
  )
}
