type P = { url: string; at: string } | null

export default function PhotoPair({ photos, name }: { photos: Record<string, P>; name: string }) {
  const one = (p: P, l: string) => (
    <div className={`slot ro${p ? ' has' : ''}`}>
      {p ? <img src={p.url} alt={l} /> : <span className="ph0">—</span>}
      <span className="sl"><b>{l}</b>{p ? <><br />{new Date(p.at).toLocaleDateString('it-IT')}</> : null}</span>
    </div>
  )
  return (
    <section className="card">
      <h3>Foto check-in</h3>
      {photos.before || photos.after ? <div className="g2">{one(photos.before, 'Prima')}{one(photos.after, 'Dopo')}</div>
        : <p className="mu" style={{ marginTop: 4 }}>Nessuna foto ancora. {name} può aggiungerle dalla scheda Foto.</p>}
    </section>
  )
}
