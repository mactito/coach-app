import Link from 'next/link'

// IMPORTANT: replace every [BRACKET] and have a lawyer review this text before the app goes live.
export default function Privacy() {
  return (
    <div className="scr">
      <Link className="back" href="/">‹ Indietro</Link>
      <h1>Informativa sulla privacy</h1>
      <p className="mu">Ultimo aggiornamento: [DATA]</p>
      <section className="card">
        <h3>Chi siamo</h3>
        <p style={{ margin: '6px 0 0' }}>Titolare del trattamento: [NOME E COGNOME / RAGIONE SOCIALE DI RAPHI], [INDIRIZZO]. Contatto: [EMAIL].</p>
      </section>
      <section className="card">
        <h3>Quali dati raccogliamo</h3>
        <p style={{ margin: '6px 0 0' }}>Account (nome, email); questionario iniziale (età, peso, altezza, obiettivo, livello, giorni di allenamento, eventuali infortuni o limitazioni); allenamenti svolti (serie, ripetizioni, pesi); piano alimentare; messaggi con il trainer; foto di controllo che carichi tu. Alcuni di questi dati riguardano la salute.</p>
      </section>
      <section className="card">
        <h3>Perché e su quale base</h3>
        <p style={{ margin: '6px 0 0' }}>Per seguirti nel tuo percorso di allenamento e alimentazione. Per i dati sulla salute la base è il tuo consenso esplicito, che puoi revocare in qualsiasi momento.</p>
      </section>
      <section className="card">
        <h3>Con chi li condividiamo</h3>
        <p style={{ margin: '6px 0 0' }}>Solo il trainer vede i tuoi dati. Non vendiamo i dati e non li usiamo per pubblicità. Ci affidiamo a fornitori tecnici che li trattano per nostro conto: Supabase (database, accesso e archiviazione delle foto) e Vercel (hosting). Per le notifiche push usiamo Firebase Cloud Messaging (Google) e le notifiche di Apple, che ricevono un codice tecnico del tuo telefono. [AGGIORNA SE USI ALTRI SERVIZI].</p>
      </section>
      <section className="card">
        <h3>Per quanto tempo</h3>
        <p style={{ margin: '6px 0 0' }}>Finché hai un account. Se lo elimini, i tuoi dati vengono cancellati.</p>
      </section>
      <section className="card">
        <h3>I tuoi diritti</h3>
        <p style={{ margin: '6px 0 0' }}>Puoi chiedere accesso, correzione, cancellazione e portabilità dei dati, opporti al trattamento e revocare il consenso. Puoi eliminare l’account da Impostazioni nell’app, oppure scrivere a [EMAIL]. Hai anche il diritto di presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).</p>
      </section>
    </div>
  )
}
