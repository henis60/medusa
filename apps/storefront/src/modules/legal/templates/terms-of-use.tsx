import { getTranslations } from "next-intl/server"

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

const TermsOfUseTemplate = async () => {
  const t = await getTranslations("legal")
  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Header */}
      <div className="page-container pt-6 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-hunter-gold" />
          <span className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
            {t("Legal")}
          </span>
        </div>
        <h1 className="font-display text-4xl small:text-6xl text-[var(--theme-text)] leading-[0.95]">
          {t("Termeni și")} <span className="italic text-hunter-gold">{t("Condiții")}</span>
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-[var(--theme-text-muted)] leading-relaxed">
          {t("Vă rugăm să citiți cu atenție înainte de a utiliza platforma noastră")}
        </p>
      </div>

      {/* Sections */}
      <div className="page-container py-10 flex flex-col gap-12">
        <Section title={t("Date de identificare")}>
          <ul className="flex flex-col gap-1.5">
            <li>{t("Denumire firmă:")} S.C. BOJO HOUSE S.R.L.</li>
            <li>{t("Nr Reg Comerțului:")} J24/356/2023</li>
            <li>{t("CUI")}: 47739604</li>
            <li>{t("Adresă:")} Str. Piața Eroilor, nr. 2, Târgu Lăpuș, Maramureș</li>
          </ul>
        </Section>

        <Section title={t("Acceptarea termenilor")}>
          <p>
            {t("Prin accesarea și utilizarea site-ului")}{" "}
            <span className="text-[var(--theme-text)]">{t("thehunterhousero")}</span>
            {t(", confirmi că ai citit, înțeles și ești de acord cu acești termeni Dacă nu ești de acord, te rugăm să nu folosești platforma")}
          </p>
          <p>
            {t("Ne rezervăm dreptul de a modifica acești termeni în orice moment Continuarea utilizării platformei după publicarea modificărilor constituie acceptarea lor")}
          </p>
        </Section>

        <Section title={t("Utilizarea platformei")}>
          <p>
            {t("Platforma este destinată utilizatorilor cu vârsta de cel puțin")}{" "}
            <span className="text-[var(--theme-text)]">{t("18 ani")}</span> {t("sau minorilor cu acordul unui tutore legal")}
          </p>
          <p>{t("Ești responsabil pentru:")}</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>{t("Confidențialitatea datelor de autentificare ale contului tău")}</li>
            <li>{t("Toate activitățile desfășurate în contul tău")}</li>
            <li>{t("Furnizarea de informații corecte și actualizate")}</li>
          </ul>
        </Section>

        <Section title={t("Produse și prețuri")}>
          <p>
            {t("Prețurile sunt afișate în")}{" "}
            <span className="text-[var(--theme-text)]">{t("Lei (RON)")}</span> {t("și includ TVA 19%, cu excepția cazului în care se specifică altfel Ne rezervăm dreptul de a modifica prețurile fără notificare prealabilă")}
          </p>
          <p>
            {t("Ne străduim să afișăm cu acuratețe culorile și detaliile produselor, însă nuanțele pot diferi ușor față de ecranul tău")}
          </p>
        </Section>

        <Section title={t("Comenzi")}>
          <p>
            {t("O comandă plasată reprezintă o ofertă de cumpărare Contractul de vânzare se consideră încheiat în momentul confirmării de expediere")}
          </p>
          <p>
            {t("Ne rezervăm dreptul de a anula o comandă în caz de stoc epuizat, eroare de preț, plată neverificată sau suspiciune de fraudă")}
          </p>
        </Section>

        <Section title={t("Livrare")}>
          <p>
            {t("Livrăm prin curier în toată România, în")}{" "}
            <span className="text-[var(--theme-text)]">{t("3–5 zile lucrătoare")}</span>
            {t(" Riscul pierderii sau deteriorării produselor trece la cumpărător în momentul intrării în posesia fizică a acestora")}
          </p>
        </Section>

        <Section label={t("OUG 34/2014")} title={t("Dreptul de retragere")}>
          <p>
            {t("Ai dreptul de a te retrage din contract în termen de")}{" "}
            <span className="text-[var(--theme-text)]">{t("14 zile calendaristice")}</span>{" "}
            {t("de la primirea produselor, fără a fi necesară justificarea deciziei")}
          </p>
          <p>
            {t("Produsele trebuie returnate în stare originală, nefolosite și cu eticheta atașată Rambursarea se face în maximum 14 zile de la primirea înștiințării de retragere")}
          </p>
          <p className="text-[var(--theme-text)]">
            {t("Produsele personalizate sau confecționate la comandă sunt exceptate de la dreptul de retragere")}
          </p>
        </Section>

        <Section title={t("Garanție")}>
          <p>
            {t("Toate produsele beneficiază de garanția legală de conformitate de")}{" "}
            <span className="text-[var(--theme-text)]">{t("2 ani")}</span> {t("de la data livrării În caz de defect, ne contactezi pe email cu numărul comenzii și ne ocupăm de reparare, înlocuire sau rambursare")}
          </p>
        </Section>

        <Section title={t("Proprietate intelectuală")}>
          <p>
            {t("Tot conținutul platformei — texte, imagini, logo-uri, design — este proprietatea exclusivă a")}{" "}
            <span className="text-[var(--theme-text)]">{t("The Hunter House")}</span> {t("sau a partenerilor săi și este protejat de legislația privind drepturile de autor Orice reproducere în scopuri comerciale fără acord scris este interzisă")}
          </p>
        </Section>

        <Section label={t("Legislație")} title={t("Legea aplicabilă")}>
          <p>
            {t("Acești termeni sunt guvernați de legislația română Litigiile vor fi soluționate în primul rând pe cale amiabilă, iar în caz contrar, prin instanțele competente din România")}
          </p>
          <div className="flex flex-col gap-1.5">
            <a
              href="https://anpc.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors w-fit"
            >
              {t("ANPC — Autoritatea Națională pentru Protecția Consumatorilor")}
            </a>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors w-fit"
            >
              {t("Platforma SOL / ODR a Comisiei Europene")}
            </a>
          </div>
        </Section>

        <Section title={t("Contact")}>
          <p>
            {t("Pentru orice întrebări legate de acești termeni, ne poți contacta la:")}
          </p>
          <ul className="flex flex-col gap-1.5">
            <li>
              {t("Email:")}{" "}
              <a
                href="mailto:contact@thehunter.ro"
                className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
              >
                contact@thehunter.ro
              </a>
            </li>
            <li>
              {t("Telefon:")}{" "}
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
