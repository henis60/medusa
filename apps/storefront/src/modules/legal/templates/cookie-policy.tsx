import { getTranslations } from "next-intl/server"
import LegalLayout from "./legal-layout"
import CookieSettings from "@modules/common/components/cookie-settings"

const CookiePolicyTemplate = async () => {
  const t = await getTranslations("legal")
  return (
    <LegalLayout
      kicker={t("Legal")}
      title={t("Politica de cookies")}
      intro={t("Folosim cookies pentru a-ți oferi o experiență cât mai bună pe site Mai jos îți explicăm ce sunt, ce tipuri folosim și cum le poți controla"
      )}
      sections={[
        {
          title: t("Ce sunt cookies"),
          body: (
            <p>
              {t("Cookies sunt fișiere text mici, stocate pe dispozitivul tău atunci când vizitezi un site Ele ajută site-ul să funcționeze corect, să îți rețină preferințele și să înțeleagă cum este folosit"
              )}
            </p>
          ),
        },
        {
          title: t("Ce tipuri de cookies folosim"),
          body: (
            <ul className="flex flex-col gap-1.5 list-disc pl-5">
              <li>
                <span className="text-[var(--theme-text)]">{t("Esențiale:")}</span>{" "}
                {t("necesare pentru funcționarea site-ului (coș, sesiune, preferințe de bază)"
                )}
              </li>
              <li>
                <span className="text-[var(--theme-text)]">{t("Funcționale:")}</span>{" "}
                {t("rețin opțiuni precum limba, regiunea sau tema")}
              </li>
              <li>
                <span className="text-[var(--theme-text)]">{t("Analitice:")}</span>{" "}
                {t("ne ajută să înțelegem cum este folosit site-ul, pentru a-l îmbunătăți Folosim Google Analytics (GA4) în acest scop, iar aceste cookies sunt plasate doar după ce îți exprimi acordul"
                )}
              </li>
            </ul>
          ),
        },
        {
          title: t("Cookies de la terți"),
          body: (
            <p>
              {t("Unele cookies pot fi plasate de servicii terțe (ex Google Analytics pentru statistici de utilizare, procesatorul de plăți sau hărți încorporate) Acestea sunt guvernate de politicile proprii ale furnizorilor respectivi Cookies analitice de la Google sunt activate doar după acordul tău și pot fi dezactivate oricând din secțiunea de mai jos"
              )}
            </p>
          ),
        },
        {
          title: t("Cum controlezi cookies"),
          body: (
            <>
              <p>
                {t("Poți gestiona sau șterge cookies din setările browserului tău Reține că dezactivarea anumitor cookies poate afecta funcționarea site-ului (ex coșul de cumpărături) Îți poți schimba oricând preferința pentru cookies analitice de mai jos"
                )}
              </p>
              <CookieSettings />
            </>
          ),
        },
        {
          title: t("Mai multe informații"),
          body: (
            <p>
              {t("Pentru detalii despre modul în care prelucrăm datele tale, consultă și politica de confidențialitate"
              )}
            </p>
          ),
        },
      ]}
    />
  )
}

export default CookiePolicyTemplate
