import LegalLayout from "./legal-layout"

const CookiePolicyTemplate = () => {
  return (
    <LegalLayout
      kicker="Legal"
      title="Politica de cookies"
      intro="Folosim cookies pentru a-ți oferi o experiență cât mai bună pe site. Mai jos îți explicăm ce sunt, ce tipuri folosim și cum le poți controla."
      sections={[
        {
          title: "Ce sunt cookies",
          body: (
            <p>
              Cookies sunt fișiere text mici, stocate pe dispozitivul tău atunci
              când vizitezi un site. Ele ajută site-ul să funcționeze corect, să
              îți rețină preferințele și să înțeleagă cum este folosit.
            </p>
          ),
        },
        {
          title: "Ce tipuri de cookies folosim",
          body: (
            <ul className="flex flex-col gap-1.5 list-disc pl-5">
              <li>
                <span className="text-[var(--theme-text)]">Esențiale:</span>{" "}
                necesare pentru funcționarea site-ului (coș, sesiune, preferințe
                de bază).
              </li>
              <li>
                <span className="text-[var(--theme-text)]">Funcționale:</span>{" "}
                rețin opțiuni precum limba, regiunea sau tema.
              </li>
              <li>
                <span className="text-[var(--theme-text)]">Analitice:</span>{" "}
                ne ajută să înțelegem cum este folosit site-ul, pentru a-l
                îmbunătăți.
              </li>
            </ul>
          ),
        },
        {
          title: "Cookies de la terți",
          body: (
            <p>
              Unele cookies pot fi plasate de servicii terțe (ex. procesatorul de
              plăți sau hărți încorporate). Acestea sunt guvernate de politicile
              proprii ale furnizorilor respectivi.
            </p>
          ),
        },
        {
          title: "Cum controlezi cookies",
          body: (
            <p>
              Poți gestiona sau șterge cookies din setările browserului tău.
              Reține că dezactivarea anumitor cookies poate afecta funcționarea
              site-ului (ex. coșul de cumpărături).
            </p>
          ),
        },
        {
          title: "Mai multe informații",
          body: (
            <p>
              Pentru detalii despre modul în care prelucrăm datele tale, consultă
              și politica de confidențialitate.
            </p>
          ),
        },
      ]}
    />
  )
}

export default CookiePolicyTemplate
