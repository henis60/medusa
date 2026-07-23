import LocalizedClientLink from "@modules/common/components/localized-client-link"

function Section({
  label,
  title,
  children,
}: {
  label?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="grid grid-cols-1 small:grid-cols-[180px_1fr] gap-4 small:gap-10 border-t border-[var(--theme-border)] pt-8">
      <div>
        {label && (
          <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-2">
            {label}
          </p>
        )}
        <h2 className="font-display text-2xl leading-tight text-[var(--theme-text)]">
          {title}
        </h2>
      </div>
      <div className="font-sans text-sm leading-relaxed text-[var(--theme-text-muted)] flex flex-col gap-4 max-w-2xl">
        {children}
      </div>
    </section>
  )
}

const CustomerServiceTemplate = () => {
  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Header */}
      <div className="page-container pt-6 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-hunter-gold" />
          <span className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
            Asistență
          </span>
        </div>
        <h1 className="font-display text-4xl small:text-6xl text-[var(--theme-text)] leading-[0.95]">
          Relații cu <span className="italic text-hunter-gold">clienții</span>
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-[var(--theme-text-muted)] leading-relaxed">
          Tot ce trebuie să știi despre comenzi, livrare, retur, mărimi și
          drepturile tale ca și consumator.
        </p>
      </div>

      {/* Sections */}
      <div className="page-container py-10 flex flex-col gap-12">
        <Section title="Contact și program">
          <p>
            Ne poți scrie oricând pe email la{" "}
            <a
              href="mailto:contact@thehunter.ro"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
            >
              contact@thehunter.ro
            </a>{" "}
            sau ne poți suna la{" "}
            <a
              href="tel:+40765080667"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
            >
              +40 765 080 667
            </a>
            .
          </p>
          <p>
            Program de lucru: luni – vineri 07:00 – 18:00, sâmbătă 09:00 – 14:30.
            Răspundem la mesaje în maximum 24 de ore în zilele lucrătoare.
          </p>
          <p>
            Ne găsești și la adresa{" "}
            <a
              href="https://maps.app.goo.gl/zdCeRp3LB2uJeLX49"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
            >
              Bulevardul Unirii 7, Baia Mare
            </a>
            .
          </p>
          <p>
            Pentru a programa o consultație sau o sesiune made to measure,
            scrie-ne un mesaj și revenim cu detalii despre pași și termene.
          </p>
          <LocalizedClientLink
            href="/contact"
            className="font-sans text-[10px] uppercase tracking-[3px] text-hunter-gold border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors w-fit pb-0.5"
          >
            Deschide formularul de contact
          </LocalizedClientLink>
        </Section>

        <Section title="Comenzi și livrare">
          <p>
            Plasezi comanda direct din magazin: alegi produsul, mărimea și
            culoarea, apoi finalizezi în câțiva pași. Primești confirmarea pe
            email imediat.
          </p>
          <p>
            <span className="text-[var(--theme-text)]">Plată:</span> online,
            securizat, cu cardul.
          </p>
          <p>
            <span className="text-[var(--theme-text)]">Livrare:</span> prin
            curier, în 3–5 zile lucrătoare, în toată România. Vei primi un cod de
            urmărire (tracking) pentru a-ți monitoriza coletul.
          </p>
        </Section>

        <Section title="Retur, schimb și rambursare">
          <p>
            Conform legislației din România și UE, ai dreptul de retragere în{" "}
            <span className="text-[var(--theme-text)]">14 zile</span> de la
            primirea produselor standard, fără a fi nevoie să justifici decizia.
          </p>
          <p>
            Returul se inițiază scriindu-ne pe email. Produsele trebuie să fie
            nepurtate, în stare originală și cu eticheta atașată. Rambursarea se
            face în maximum 14 zile de la primirea înștiințării de retragere.
          </p>
          <p className="text-[var(--theme-text)]">
            Important: produsele personalizate sau confecționate la comandă (pe
            măsură) sunt exceptate de la dreptul de retragere și nu pot fi
            returnate, conform legii.
          </p>
        </Section>

        <Section title="Mărimi și produs">
          <p>
            Consultă ghidul de mărimi înainte de comandă pentru a alege corect.
            Dacă ești între două mărimi, scrie-ne și te ajutăm.
          </p>
          <p>
            Respectă instrucțiunile de îngrijire de pe etichetă pentru a păstra
            calitatea materialelor. Culorile reale pot diferi ușor față de
            fotografii, în funcție de ecran și de iluminare.
          </p>
        </Section>

        <Section title="Garanție și conformitate">
          <p>
            Beneficiezi de garanția legală de conformitate de{" "}
            <span className="text-[var(--theme-text)]">2 ani</span>, conform
            legislației UE.
          </p>
          <p>
            Dacă ai primit un produs cu defect, scrie-ne pe email cu numărul
            comenzii și o descriere a problemei, iar noi ne ocupăm de reparare,
            înlocuire sau rambursare, după caz.
          </p>
        </Section>

        <Section title="Informații legale">
          <ul className="flex flex-col gap-1.5">
            <li>Denumire firmă: [Completează]</li>
            <li>CUI: [Completează]</li>
            <li>Nr. Reg. Comerțului: [Completează]</li>
            <li>Adresă: [Completează]</li>
            <li>Capital social: [Completează, dacă este cazul]</li>
          </ul>
          <div className="flex flex-col gap-1.5">
            <a
              href="https://anpc.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors w-fit"
            >
              ANPC — Autoritatea Națională pentru Protecția Consumatorilor
            </a>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors w-fit"
            >
              Platforma SOL / ODR a Comisiei Europene
            </a>
          </div>
          <p>
            Litigiile pot fi soluționate și pe cale alternativă (SAL), prin
            intermediul ANPC.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <LocalizedClientLink
              href="/privacy-policy"
              className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
            >
              Politica de confidențialitate
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/cookie-policy"
              className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
            >
              Politica de cookies
            </LocalizedClientLink>
          </div>
        </Section>

        <Section title="Întrebări frecvente">
          <p>
            Încă ai întrebări? Răspunsurile la cele mai comune întrebări despre
            comenzi, livrare, retur și plată sunt pe pagina dedicată.
          </p>
          <LocalizedClientLink
            href="/faq"
            className="font-sans text-[10px] uppercase tracking-[3px] text-hunter-gold border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors w-fit pb-0.5"
          >
            Vezi întrebările frecvente
          </LocalizedClientLink>
        </Section>
      </div>
    </div>
  )
}

export default CustomerServiceTemplate
