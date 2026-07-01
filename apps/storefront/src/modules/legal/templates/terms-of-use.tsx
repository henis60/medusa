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

const TermsOfUseTemplate = () => {
  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Header */}
      <div className="page-container pt-6 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-hunter-gold" />
          <span className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
            Legal
          </span>
        </div>
        <h1 className="font-display text-4xl small:text-6xl text-[var(--theme-text)] leading-[0.95]">
          Termeni și <span className="italic text-hunter-gold">Condiții</span>
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-[var(--theme-text-muted)] leading-relaxed">
          Vă rugăm să citiți cu atenție înainte de a utiliza platforma noastră.
        </p>
      </div>

      {/* Sections */}
      <div className="page-container py-10 flex flex-col gap-12">
        <Section title="Acceptarea termenilor">
          <p>
            Prin accesarea și utilizarea site-ului{" "}
            <span className="text-[var(--theme-text)]">thehunterhouse.ro</span>,
            confirmi că ai citit, înțeles și ești de acord cu acești termeni. Dacă
            nu ești de acord, te rugăm să nu folosești platforma.
          </p>
          <p>
            Ne rezervăm dreptul de a modifica acești termeni în orice moment.
            Continuarea utilizării platformei după publicarea modificărilor
            constituie acceptarea lor.
          </p>
        </Section>

        <Section title="Utilizarea platformei">
          <p>
            Platforma este destinată utilizatorilor cu vârsta de cel puțin{" "}
            <span className="text-[var(--theme-text)]">18 ani</span> sau minorilor
            cu acordul unui tutore legal.
          </p>
          <p>Ești responsabil pentru:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Confidențialitatea datelor de autentificare ale contului tău</li>
            <li>Toate activitățile desfășurate în contul tău</li>
            <li>Furnizarea de informații corecte și actualizate</li>
          </ul>
        </Section>

        <Section title="Produse și prețuri">
          <p>
            Prețurile sunt afișate în{" "}
            <span className="text-[var(--theme-text)]">Lei (RON)</span> și includ
            TVA 19%, cu excepția cazului în care se specifică altfel. Ne rezervăm
            dreptul de a modifica prețurile fără notificare prealabilă.
          </p>
          <p>
            Ne străduim să afișăm cu acuratețe culorile și detaliile produselor,
            însă nuanțele pot diferi ușor față de ecranul tău.
          </p>
        </Section>

        <Section title="Comenzi">
          <p>
            O comandă plasată reprezintă o ofertă de cumpărare. Contractul de
            vânzare se consideră încheiat în momentul confirmării de expediere.
          </p>
          <p>
            Ne rezervăm dreptul de a anula o comandă în caz de stoc epuizat,
            eroare de preț, plată neverificată sau suspiciune de fraudă.
          </p>
        </Section>

        <Section title="Livrare">
          <p>
            Livrăm prin curier în toată România, în{" "}
            <span className="text-[var(--theme-text)]">3–5 zile lucrătoare</span>.
            Riscul pierderii sau deteriorării produselor trece la cumpărător în
            momentul intrării în posesia fizică a acestora.
          </p>
        </Section>

        <Section label="OUG 34/2014" title="Dreptul de retragere">
          <p>
            Ai dreptul de a te retrage din contract în termen de{" "}
            <span className="text-[var(--theme-text)]">14 zile calendaristice</span>{" "}
            de la primirea produselor, fără a fi necesară justificarea deciziei.
          </p>
          <p>
            Produsele trebuie returnate în stare originală, nefolosite și cu
            eticheta atașată. Rambursarea se face în maximum 14 zile de la
            primirea înștiințării de retragere.
          </p>
          <p className="text-[var(--theme-text)]">
            Produsele personalizate sau confecționate la comandă sunt exceptate de
            la dreptul de retragere.
          </p>
        </Section>

        <Section title="Garanție">
          <p>
            Toate produsele beneficiază de garanția legală de conformitate de{" "}
            <span className="text-[var(--theme-text)]">2 ani</span> de la data
            livrării. În caz de defect, ne contactezi pe email cu numărul comenzii
            și ne ocupăm de reparare, înlocuire sau rambursare.
          </p>
        </Section>

        <Section title="Proprietate intelectuală">
          <p>
            Tot conținutul platformei — texte, imagini, logo-uri, design — este
            proprietatea exclusivă a{" "}
            <span className="text-[var(--theme-text)]">The Hunter House</span> sau
            a partenerilor săi și este protejat de legislația privind drepturile de
            autor. Orice reproducere în scopuri comerciale fără acord scris este
            interzisă.
          </p>
        </Section>

        <Section label="Legislație" title="Legea aplicabilă">
          <p>
            Acești termeni sunt guvernați de legislația română. Litigiile vor fi
            soluționate în primul rând pe cale amiabilă, iar în caz contrar, prin
            instanțele competente din România.
          </p>
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
        </Section>

        <Section title="Contact">
          <p>
            Pentru orice întrebări legate de acești termeni, ne poți contacta la:
          </p>
          <ul className="flex flex-col gap-1.5">
            <li>
              Email:{" "}
              <a
                href="mailto:contact@thehunter.ro"
                className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
              >
                contact@thehunter.ro
              </a>
            </li>
            <li>
              Telefon:{" "}
              <a
                href="tel:+40765080667"
                className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
              >
                +40 765 080 667
              </a>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  )
}

export default TermsOfUseTemplate
