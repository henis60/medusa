import LegalLayout from "./legal-layout"

const PrivacyPolicyTemplate = () => {
  return (
    <LegalLayout
      kicker="Legal"
      title="Politica de confidențialitate"
      intro="Confidențialitatea ta este importantă pentru noi. Mai jos explicăm ce date colectăm, de ce și cum le protejăm, conform Regulamentului (UE) 2016/679 (GDPR)."
      sections={[
        {
          title: "Operatorul de date",
          body: (
            <>
              <p>
                Datele tale cu caracter personal sunt prelucrate de [Denumire
                firmă], cu sediul în [Adresă], CUI [Completează], înregistrată la
                Registrul Comerțului sub nr. [Completează].
              </p>
              <p>
                Pentru orice întrebare legată de datele tale, ne poți scrie la{" "}
                <a
                  href="mailto:contact@thehunter.ro"
                  className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
                >
                  contact@thehunter.ro
                </a>
                .
              </p>
            </>
          ),
        },
        {
          title: "Ce date colectăm",
          body: (
            <ul className="flex flex-col gap-1.5 list-disc pl-5">
              <li>Date de identificare și contact: nume, email, telefon, adresă.</li>
              <li>Date despre comenzi: produse, valoare, istoric.</li>
              <li>Date de livrare: adresă, detalii curier.</li>
              <li>Date tehnice: adresă IP, tip de browser, cookies (vezi politica de cookies).</li>
            </ul>
          ),
        },
        {
          title: "Scopul prelucrării",
          body: (
            <ul className="flex flex-col gap-1.5 list-disc pl-5">
              <li>Procesarea și livrarea comenzilor.</li>
              <li>Emiterea documentelor fiscale.</li>
              <li>Asistență și comunicare cu tine.</li>
              <li>Respectarea obligațiilor legale.</li>
              <li>Marketing, doar cu acordul tău explicit.</li>
            </ul>
          ),
        },
        {
          title: "Temeiul legal",
          body: (
            <p>
              Prelucrăm datele în baza executării contractului (comanda ta), a
              obligațiilor legale (ex. fiscale), a interesului legitim și, după
              caz, a consimțământului tău.
            </p>
          ),
        },
        {
          title: "Cât timp păstrăm datele",
          body: (
            <p>
              Păstrăm datele atât cât este necesar pentru scopurile de mai sus și
              conform termenelor legale (ex. documentele contabile se păstrează
              conform legislației în vigoare).
            </p>
          ),
        },
        {
          title: "Cui dezvăluim datele",
          body: (
            <p>
              Putem transmite date către furnizori de servicii care ne ajută să
              îți onorăm comanda: curieri, procesatori de plăți, furnizori IT.
              Aceștia prelucrează datele doar în limita instrucțiunilor noastre.
            </p>
          ),
        },
        {
          title: "Drepturile tale",
          body: (
            <>
              <p>
                Conform GDPR, ai dreptul de acces, rectificare, ștergere,
                restricționare, portabilitate și opoziție, precum și dreptul de
                a-ți retrage consimțământul.
              </p>
              <p>
                Îți poți exercita drepturile scriindu-ne la{" "}
                <a
                  href="mailto:contact@thehunter.ro"
                  className="text-[var(--theme-text)] border-b border-hunter-gold/40 hover:border-hunter-gold transition-colors"
                >
                  contact@thehunter.ro
                </a>
                . De asemenea, ai dreptul de a depune o plângere la Autoritatea
                Națională de Supraveghere a Prelucrării Datelor cu Caracter
                Personal (ANSPDCP).
              </p>
            </>
          ),
        },
      ]}
    />
  )
}

export default PrivacyPolicyTemplate
