"use client"

import { useTranslations } from "next-intl"

import Newsletter from "./Newsletter"

export default function Contact() {
  const t = useTranslations("home")

  return (
    <section className="section contact-sec" id="contact">
      <div className="section-inner">
        <div className="contact-layout">
          <div>
            <div className="kicker rv">
              {t("Contact")}
            </div>
            <h2 className="sec-title rv">
              {t("Totul începe cu")}
              <br />
              {t("o")} <em>{t("conversație")}</em>
            </h2>
            <p className="contact-desc rv" data-rv-delay="0.08">
              {t("Rezervă o consultație de stil, o sesiune Made to Measure sau o experiență la The Hunter Bar")}
            </p>
            <a
              className="cb-appt rv"
              href="https://wa.me/40771793211"
              target="_blank"
              rel="noopener noreferrer"
              data-rv-delay="0.14"
              style={{
                marginTop: "20px",
                display: "block",
                textDecoration: "none",
              }}
            >
              <div className="cb-appt-label">{t("Programare")}</div>
              <div className="cb-appt-phone">+40 771 793 211</div>
              <div className="cb-appt-channels">{t("WhatsApp")}</div>
            </a>
          </div>
          <div
            className="contact-blocks rv"
            data-rv-delay="0.12"
          >
            <div className="cb">
              <div className="cb-type">{t("Telefon")}</div>
              <div className="cb-vals">
                <a href="tel:+40765080667" className="cb-value">
                  +40 765 080 667
                </a>
              </div>
            </div>
            <div className="cb">
              <div className="cb-type">{t("Email")}</div>
              <a href="mailto:contact@thehunter.ro" className="cb-value">
                contact@thehunter.ro
              </a>
            </div>
            <div className="cb">
              <div className="cb-type">{t("Locație")}</div>
              <a
                href="https://maps.app.goo.gl/zdCeRp3LB2uJeLX49"
                className="cb-value"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Bulevardul Unirii 7, Baia Mare")}
              </a>
            </div>
            <div className="cb">
              <div className="cb-type">{t("Program")}</div>
              <div className="cb-vals">
                <div className="cb-value">{t("Luni – Vineri · 07:00 – 18:00")}</div>
                <div className="cb-value">{t("Sâmbătă · 09:00 – 14:30")}</div>
              </div>
            </div>
            <div
              className="socials rv"
              data-rv-delay="0.2"
              style={{ marginTop: "28px" }}
            >
              <a
                href="https://instagram.com/thehunter.house"
                className="soc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("The Hunter House pe Instagram (se deschide în filă nouă)")}
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/THEHUNTER.SUITS"
                className="soc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("The Hunter House pe Facebook (se deschide în filă nouă)")}
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@thehunterofficial.store"
                className="soc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("The Hunter House pe TikTok (se deschide în filă nouă)")}
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        <Newsletter />
      </div>
    </section>
  )
}
