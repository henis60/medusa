"use client"

export default function Contact() {
  return (
    <section className="section contact-sec" id="contact">
      <div className="section-inner">
        <div className="contact-layout">
          <div>
            <div className="kicker rv">
              <span className="kicker-bar"></span>Contact
            </div>
            <h2 className="sec-title rv">
              Totul începe cu
              <br />o <em>conversație.</em>
            </h2>
            <p className="contact-desc rv" style={{ transitionDelay: "0.08s" }}>
              Rezervă o consultație de stil, o sesiune Made to Measure sau o
              experiență la The Hunter Bar.
            </p>
            <a
              className="cb-appt rv"
              href="https://wa.me/40771793211"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: "20px",
                transitionDelay: "0.14s",
                display: "block",
                textDecoration: "none",
              }}
            >
              <div className="cb-appt-label">Programare</div>
              <div className="cb-appt-phone">+40 771 793 211</div>
              <div className="cb-appt-channels">WhatsApp</div>
            </a>
          </div>
          <div
            className="contact-blocks rv"
            style={{ transitionDelay: "0.12s", alignSelf: "end" }}
          >
            <div className="cb">
              <div className="cb-type">Telefon</div>
              <div className="cb-vals">
                <a href="tel:+40765080667" className="cb-value">
                  +40 765 080 667
                </a>
              </div>
            </div>
            <div className="cb">
              <div className="cb-type">Email</div>
              <a href="mailto:contact@thehunter.ro" className="cb-value">
                contact@thehunter.ro
              </a>
            </div>
            <div className="cb">
              <div className="cb-type">Locație</div>
              <a
                href="https://maps.app.goo.gl/zdCeRp3LB2uJeLX49"
                className="cb-value"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bulevardul Unirii 7, Baia Mare
              </a>
            </div>
            <div className="cb">
              <div className="cb-type">Program</div>
              <div className="cb-vals">
                <div className="cb-value">Luni – Vineri · 07:00 – 18:00</div>
                <div className="cb-value">Sâmbătă · 09:00 – 14:30</div>
              </div>
            </div>
            <div
              className="socials rv"
              style={{ marginTop: "28px", transitionDelay: "0.2s" }}
            >
              <a
                href="https://instagram.com/thehunter.house"
                className="soc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Hunter House pe Instagram (se deschide în filă nouă)"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/THEHUNTER.SUITS"
                className="soc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Hunter House pe Facebook (se deschide în filă nouă)"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@thehunterofficial.store"
                className="soc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Hunter House pe TikTok (se deschide în filă nouă)"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
