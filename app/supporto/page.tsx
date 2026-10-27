import Link from 'next/link'

export default function Supporto() {
  return (
    <div className="scr">
      <Link className="back" href="/">‹ Indietro</Link>
      <h1>Supporto</h1>
      <p className="mu">Serve aiuto con l’app? Scrivici.</p>
      <section className="card">
        <h3>Contatti</h3>
        <p style={{ margin: '6px 0 0' }}>Email: [EMAIL DI SUPPORTO]</p>
      </section>
      <section className="card">
        <h3>Come eliminare il tuo account</h3>
        <p style={{ margin: '6px 0 0' }}>Nell’app apri <b>Impostazioni → Elimina il mio account</b> e conferma. Se non riesci ad accedere, scrivi all’indirizzo qui sopra dallo stesso indirizzo email dell’account e lo eliminiamo noi. Verranno cancellati profilo, questionario, allenamenti, foto, messaggi e piano alimentare.</p>
      </section>
      <section className="card">
        <h3>Privacy</h3>
        <p style={{ margin: '6px 0 0' }}>Leggi l’<Link href="/privacy" style={{ color: 'var(--ac)' }}>informativa sulla privacy</Link>.</p>
      </section>
    </div>
  )
}
