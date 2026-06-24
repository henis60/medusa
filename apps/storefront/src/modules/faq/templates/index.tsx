import LocalizedClientLink from "@modules/common/components/localized-client-link"

type FaqItem = { q: string; a: string }
type FaqGroup = { title: string; items: FaqItem[] }

const groups: FaqGroup[] = [
  {
    title: "Comenzi",
    items: [
      {
        q: "Cum plasez o comandă?",
        a: "Alege produsul dorit, selectează mărimea și culoarea, adaugă-l în coș și urmează pașii de la finalizarea comenzii. Vei primi un email de confirmare imediat ce comanda este înregistrată.",
      },
      {
        q: "Pot modifica sau anula o comandă?",
        a: "Contactează-ne cât mai repede posibil după plasarea comenzii. Dacă aceasta nu a fost încă expediată, o putem modifica sau anula.",
      },
    ],
  },
  {
    title: "Livrare",
    items: [
      {
        q: "Cât durează livrarea?",
        a: "Coletul ajunge în 3–5 zile lucrătoare la adresa ta sau la un punct de ridicare.",
      },
      {
        q: "Livrați în toată România?",
        a: "Da, livrăm în toată țara prin curier.",
      },
    ],
  },
  {
    title: "Retururi & Schimburi",
    items: [
      {
        q: "Care este politica de retur?",
        a: "Poți returna produsele în termen de 14 zile de la primire. Produsele trebuie să fie nepurtate și în ambalajul original.",
      },
      {
        q: "Cum schimb mărimea unui produs?",
        a: "Contactează-ne și îți spunem pașii pentru schimbul de mărime, în limita stocului disponibil.",
      },
    ],
  },
  {
    title: "Plată",
    items: [
      {
        q: "Ce metode de plată acceptați?",
        a: "Acceptăm plata online securizată cu cardul. Tranzacțiile sunt procesate printr-un furnizor de plăți securizat.",
      },
      {
        q: "Plata online este sigură?",
        a: "Da. Datele cardului sunt procesate direct de furnizorul de plăți și nu sunt stocate pe site-ul nostru.",
      },
    ],
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    }))
  ),
}

const FAQTemplate = () => {
  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Header */}
      <div className="page-container pt-6 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-hunter-gold" />
          <span className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
            Ajutor
          </span>
        </div>
        <h1 className="font-display text-4xl small:text-6xl text-[var(--theme-text)] leading-[0.95]">
          Întrebări <span className="italic text-hunter-gold">frecvente</span>
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-[var(--theme-text-muted)] leading-relaxed">
          Răspunsuri la cele mai comune întrebări despre comenzi, livrare,
          retururi și plată.
        </p>
      </div>

      {/* Groups */}
      <div className="page-container py-10 flex flex-col gap-14">
        {groups.map((group) => (
          <section key={group.title}>
            <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-5">
              {group.title}
            </p>
            <div className="border-t border-[var(--theme-border)]">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-[var(--theme-border)]"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-5">
                    <span className="font-serif text-xl leading-snug text-[var(--theme-text)]">
                      {item.q}
                    </span>
                    <span className="shrink-0 text-[var(--theme-text-muted)] transition-transform duration-200 group-open:rotate-45">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <line x1="7" y1="1" x2="7" y2="13" />
                        <line x1="1" y1="7" x2="13" y2="7" />
                      </svg>
                    </span>
                  </summary>
                  <p className="font-sans text-sm leading-relaxed text-[var(--theme-text-muted)] pb-6 max-w-2xl">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Contact footer */}
        <div className="flex flex-col small:flex-row items-start small:items-center justify-between border-t border-[var(--theme-border)] pt-10 gap-6">
          <div>
            <p className="font-display text-[20px] leading-[1.1] text-[var(--theme-text)] mb-2">
              Nu ai găsit răspunsul?
            </p>
            <p className="font-sans text-[12px] text-[var(--theme-text-muted)]">
              Scrie-ne și te ajutăm cu plăcere.
            </p>
          </div>
          <LocalizedClientLink
            href="/contact"
            className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
          >
            Contactează-ne
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default FAQTemplate
