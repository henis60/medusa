import Image from "next/image"

import MeridianCanvas from "../components/meridian-canvas"
import MeridianHeader from "../components/meridian-header"
import ProgramRows from "../components/program-rows"
import Reveal from "../components/reveal"
import SponsorMarquee from "../components/sponsor-marquee"
import ThemeTimeline from "../components/theme-timeline"

const TICKET_INCLUDES = [
  "Acces la expoziția celor douăsprezece automobile",
  "Concertul live de blues & jazz, în aer liber",
  "Expoziția de pictură și sculptură",
  "Prezentarea celor trei colecții The Hunter House",
  "Șampanie și gastronomie premium",
  "Parcare la locație",
]

const eyebrowRow = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
} as const

const eyebrowRule = { height: 1, width: 48, background: "#8b6914" } as const

const eyebrowLabel = {
  fontFamily: "var(--rl)",
  fontSize: 10,
  letterSpacing: "0.7em",
  textTransform: "uppercase",
  color: "#8b6914",
} as const

const sectionHeading = {
  fontFamily: "var(--pd)",
  fontSize: "clamp(34px,4.5vw,62px)",
  fontWeight: 400,
  lineHeight: 1.06,
  color: "var(--ivory)",
} as const

const ctaBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 14,
  padding: "15px 36px",
  fontFamily: "var(--rl)",
  fontSize: 10,
  letterSpacing: "0.6em",
  textTransform: "uppercase",
} as const

export default function MeridianTemplate() {
  return (
    <div className="thm-root">
      <MeridianHeader />
      <div className="thm-hero-shell">
      <div aria-hidden="true" style={{ height: 74, flex: "0 0 auto" }} />

      {/* Hero */}
      <section
        className="thm-hero-section"
        style={{
          position: "relative",
          overflow: "hidden",
          flex: 1,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding:
            "clamp(40px,7vw,80px) var(--pad) clamp(56px,9vw,96px)",
          background: "linear-gradient(180deg, #12291f 0%, #0d1f17 100%)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "repeating-linear-gradient(90deg, transparent 0 19.99%, rgba(201,168,76,0.07) 20% 20.05%, transparent 20.06% 40%)",
          }}
        />
        <Reveal>
        <div className="thm-hero-content" style={{ position: "relative", maxWidth: 1360, margin: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 34,
            }}
          >
            <span
              style={{ height: 1, flex: "0 0 40px", background: "#8b6914" }}
            />
            <span
              style={{
                fontFamily: "var(--rl)",
                fontSize: 11,
                letterSpacing: "0.6em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.6)",
              }}
            >
              Ediția I · 26 septembrie 2026
            </span>
            <span
              style={{
                height: 1,
                flex: "1 1 40px",
                background: "linear-gradient(90deg, #8b6914, transparent)",
              }}
            />
          </div>
          <h1
            style={{
              fontFamily: "var(--pd)",
              fontWeight: 400,
              fontSize: "clamp(38px,6vw,86px)",
              lineHeight: 1.06,
              color: "var(--ivory)",
              margin: 0,
              maxWidth: "20ch",
            }}
          >
            Meridianul pe care eleganța Vestului își găsește{" "}
            <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
              rădăcini în Est
            </em>
          </h1>
          <p
            style={{
              fontFamily: "var(--cg)",
              fontSize: "clamp(17px,1.6vw,21px)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.75,
              color: "rgba(232,213,163,0.72)",
              maxWidth: "62ch",
              margin: "34px 0 0",
            }}
          >
            Douăsprezece automobile în șase perechi clasic–contemporan, un
            concert de blues &amp; jazz în aer liber, o expoziție de pictură și
            sculptură și trei colecții Made to Measure The Hunter House. O zi, la
            Colonia Pictorilor.
          </p>
          <div
            className="thm-hero-cta-row"
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginTop: 44,
            }}
          >
            <a
              href="#bilete"
              className="thm-btn-solid thm-hero-cta"
              style={{
                ...ctaBase,
                background: "var(--gold)",
                color: "#0d1f17",
                justifyContent: "center",
                transition: "background .3s",
              }}
            >
              Cumpără bilete{" "}
              <span style={{ fontSize: 15, color: "#0d1f17" }}>→</span>
            </a>
            <a
              href="#program"
              className="thm-btn-outline thm-hero-cta"
              style={{
                ...ctaBase,
                border: "1px solid rgba(201,168,76,0.45)",
                color: "rgba(232,213,163,0.78)",
                justifyContent: "center",
                transition: "border-color .3s, background .3s, color .3s",
              }}
            >
              Vezi programul{" "}
              <span style={{ fontSize: 15, color: "rgba(201,168,76,0.55)" }}>
                →
              </span>
            </a>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Sponsors marquee */}
      <section
        aria-label="Sponsori și parteneri"
        style={{
          padding: "clamp(18px,2vw,28px) 0",
          borderBottom: "1px solid rgba(201,168,76,0.18)",
          overflow: "hidden",
        }}
      >
        <SponsorMarquee />
      </section>
      </div>

      {/* Concept */}
      <section
        id="concept"
        style={{
          padding: "clamp(56px,9vw,96px) var(--pad)",
          background: "var(--dark2)",
        }}
      >
        <Reveal>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div style={eyebrowRow}>
            <span style={eyebrowRule} />
            <span style={eyebrowLabel}>Conceptul</span>
          </div>
          <h2 style={{ ...sectionHeading, margin: "0 0 40px", maxWidth: "24ch" }}>
            Nu un eveniment.{" "}
            <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
              O tradiție.
            </em>
          </h2>
          <div className="thm-concept-grid">
            <div style={{ gridArea: "text" }}>
              <p
                style={{
                  fontFamily: "var(--cg)",
                  fontSize: 17,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(245,240,232,0.7)",
                  margin: 0,
                }}
              >
                Europa are un circuit al eleganței contemporane — Ascot,
                Gstaad, Pebble Beach, Saint-Tropez. The Hunter Meridian aduce
                acest standard în Maramureș, tradus autentic, nu copiat. Devine
                un reper anual, cu temă și piese noi la fiecare ediție. Ediția
                I: evoluția automobilului, de la clasic la contemporan — iar
                partenerii ei intră în istoria brandului.
              </p>
            </div>
            <div
              style={{
                gridArea: "canvas",
                position: "relative",
                aspectRatio: "1",
                maxWidth: 380,
                margin: "0 auto",
                width: "100%",
              }}
            >
              <MeridianCanvas />
            </div>
            <blockquote
              style={{
                gridArea: "quote",
                fontFamily: "var(--pd)",
                fontSize: "clamp(20px,2vw,25px)",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1.35,
                color: "var(--gold-b)",
                margin: "28px 0 0",
                paddingLeft: 20,
                borderLeft: "2px solid rgba(201,168,76,0.4)",
                maxWidth: "40ch",
              }}
            >
              Un meridian nu desparte lumile. Le conectează.
            </blockquote>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Tema */}
      <section
        id="tema"
        style={{
          padding: "clamp(56px,9vw,96px) var(--pad)",
          background: "var(--dark)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1360, margin: "0 auto", position: "relative" }}>
          <Reveal>
          <div style={eyebrowRow}>
            <span style={eyebrowRule} />
            <span style={eyebrowLabel}>Tema Ediției I</span>
          </div>
          <h2 style={{ ...sectionHeading, margin: 0, maxWidth: "16ch" }}>
            Evoluția{" "}
            <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
              automobilului
            </em>
          </h2>
          <p
            style={{
              fontFamily: "var(--cg)",
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.75,
              color: "rgba(232,213,163,0.65)",
              maxWidth: "62ch",
              margin: "20px 0 0",
            }}
          >
            Douăsprezece automobile. Șase perechi. Aceleași mărci, la șaizeci de
            ani distanță — expuse față în față.
          </p>
          </Reveal>
          <ThemeTimeline />
        </div>

        <Reveal>
        <div className="thm-piesa-grid">
          <div>
            <span style={eyebrowLabel}>Piesa centrală</span>
            <h3
              style={{
                fontFamily: "var(--pd)",
                fontSize: "clamp(28px,3.2vw,44px)",
                fontWeight: 400,
                lineHeight: 1.08,
                color: "var(--ivory)",
                margin: "14px 0 0",
                maxWidth: "22ch",
              }}
            >
              Lamborghini{" "}
              <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                Centenario Tractor
              </em>
            </h3>
            <p
              style={{
                fontFamily: "var(--cg)",
                fontSize: 18,
                fontWeight: 300,
                lineHeight: 1.75,
                color: "rgba(245,240,232,0.7)",
                margin: "24px 0 0",
                maxWidth: "54ch",
              }}
            >
              Operă de artă unicat, atestată oficial de Lamborghini. Prima
              expunere publică în România. Înaintea supercar-urilor, Ferruccio
              Lamborghini construia tractoare. Aici a început totul.
            </p>
            <p
              style={{
                fontFamily: "var(--cg)",
                fontSize: 18,
                fontWeight: 300,
                lineHeight: 1.75,
                color: "rgba(245,240,232,0.7)",
                margin: "20px 0 0",
                maxWidth: "54ch",
              }}
            >
              Lângă el așezăm un Lamborghini nou, care spune cealaltă parte a
              aceleiași povești: ce a crescut în șaizeci de ani din tractorul
              acela. Tractorul e acolo să amintească ce anume susține valoarea
              mașinii de lângă el.
            </p>
          </div>
          <figure
            style={{
              margin: 0,
              justifySelf: "end",
              width: "min(640px,100%)",
              border: "1px solid rgba(201,168,76,0.25)",
              padding: 10,
              background: "var(--dark2)",
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 2" }}>
              <Image
                src="/meridian/thm-piesa.webp"
                alt="Lamborghini Centenario Tractor"
                fill
                sizes="(max-width: 900px) 100vw, 640px"
                style={{ objectFit: "cover", objectPosition: "39% 50%" }}
              />
            </div>
          </figure>
        </div>
        </Reveal>
      </section>

      {/* Program */}
      <section id="program" style={{ background: "var(--dark2)" }}>
        <ProgramRows />
      </section>

      {/* Bilete */}
      <section
        id="bilete"
        style={{
          padding: "clamp(56px,9vw,96px) var(--pad)",
          background: "var(--dark2)",
        }}
      >
        <Reveal>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div style={eyebrowRow}>
            <span style={eyebrowRule} />
            <span style={eyebrowLabel}>Bilete</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: "var(--pd)",
                fontSize: "clamp(24px,2.4vw,32px)",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "var(--ivory)",
                maxWidth: "18ch",
              }}
            >
              Acces{" "}
              <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                General Pass
              </em>
            </span>
            <span
              style={{
                fontFamily: "var(--rl)",
                fontSize: 9,
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "#8b6914",
              }}
            >
              Ce include
            </span>
          </div>
          <div style={{ margin: "0 0 40px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px 40px",
              }}
            >
              {TICKET_INCLUDES.map((item) => (
                <div
                  key={item}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "0 0 auto",
                      width: 5,
                      height: 5,
                      background: "#8b6914",
                      transform: "rotate(45deg)",
                      marginTop: 10,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--cg)",
                      fontSize: 17,
                      fontWeight: 300,
                      lineHeight: 1.6,
                      color: "rgba(245,240,232,0.72)",
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href="mailto:contact@thehunter.ro"
              className="thm-btn-solid"
              style={{
                ...ctaBase,
                background: "var(--gold)",
                color: "#0d1f17",
                transition: "background .3s",
              }}
            >
              Cumpără bilete{" "}
              <span style={{ fontSize: 15, color: "#0d1f17" }}>→</span>
            </a>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Locația */}
      <section id="locatia" style={{ background: "var(--dark)" }}>
        <div
          className="thm-locatia-media"
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            borderBottom: "1px solid rgba(201,168,76,0.25)",
          }}
        >
          <Image
            src="/meridian/thm-locatia.webp"
            alt="Colonia Pictorilor, Baia Mare"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(13,31,23,0.6) 0%, rgba(13,31,23,0.4) 40%, rgba(13,31,23,0.9) 100%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "clamp(20px,3.5vw,40px) var(--pad)",
            }}
          >
            <div style={{ ...eyebrowRow, marginBottom: 12 }}>
              <span style={eyebrowRule} />
              <span
                style={{ ...eyebrowLabel, color: "rgba(201,168,76,0.85)" }}
              >
                Locația
              </span>
            </div>
            <h2
              className="thm-locatia-heading"
              style={{
                fontFamily: "var(--pd)",
                fontSize: "clamp(28px,3.6vw,50px)",
                fontWeight: 400,
                lineHeight: 1.05,
                color: "var(--ivory)",
                margin: 0,
                maxWidth: "22ch",
              }}
            >
              Colonia Pictorilor,{" "}
              <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                Baia Mare
              </em>
            </h2>
            <p
              style={{
                fontFamily: "var(--cg)",
                fontSize: 17,
                fontWeight: 300,
                lineHeight: 1.7,
                color: "rgba(245,240,232,0.8)",
                margin: "14px 0 0",
                maxWidth: "58ch",
              }}
            >
              O locație cu tradiție în artă, la 20 de minute de centrul Băii
              Mari: verde, clădiri de epocă, ateliere care funcționează și
              astăzi. Spațiu generos în aer liber, cu zonă acoperită, scenă
              pentru concert și parcare amplă.
            </p>
          </div>
        </div>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Colonia+Pictorilor,+Baia+Mare"
          target="_blank"
          rel="noopener"
          aria-label="Indicații către locație"
          className="thm-map-link"
          style={{
            position: "relative",
            display: "block",
            background: "var(--dark2)",
            height: "clamp(140px,16vh,180px)",
          }}
        >
          <iframe
            src="https://www.google.com/maps?q=Colonia+Pictorilor,+Baia+Mare&z=15&output=embed"
            title="Hartă Google — Colonia Pictorilor, Baia Mare"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="thm-map-dark"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              border: 0,
              pointerEvents: "none",
            }}
          />
          {/* The embed API has no marker-styling option, so the default red
              pin is masked by the dark filter and this gold pin is overlaid
              at the map's center — where a "q="-style embed always anchors
              its marker — to match the brand. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 32"
            className="thm-map-pin"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 30,
              height: 40,
              transform: "translate(-50%, -100%)",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))",
              pointerEvents: "none",
            }}
          >
            <path
              d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"
              fill="#c9a84c"
              stroke="#0d1f17"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="4.5" fill="#0d1f17" />
          </svg>
          <span aria-hidden="true" className="thm-map-overlay">
            Indicații către locație →
          </span>
        </a>
      </section>

      {/* Contact */}
      <section
        id="contact"
        style={{
          padding: "clamp(56px,9vw,96px) var(--pad)",
          background: "var(--dark)",
        }}
      >
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div className="thm-contact-grid">
          <div style={{ gridArea: "title" }}>
            <div style={eyebrowRow}>
              <span style={eyebrowRule} />
              <span style={eyebrowLabel}>Contact</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--pd)",
                fontSize: "clamp(30px,3.6vw,50px)",
                fontWeight: 400,
                lineHeight: 1.08,
                color: "var(--ivory)",
                margin: 0,
                maxWidth: "18ch",
              }}
            >
              Explorăm împreună o posibilă{" "}
              <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                colaborare?
              </em>
            </h2>
          </div>
          <div style={{ gridArea: "wa" }}>
            <a
              href="https://wa.me/40765080667"
              target="_blank"
              rel="noopener"
              className="thm-btn-outline thm-whatsapp-cta"
              style={{
                marginTop: 28,
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                border: "1px solid rgba(201,168,76,0.45)",
                padding: "15px 32px",
                fontFamily: "var(--rl)",
                fontSize: 10,
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(232,213,163,0.78)",
                transition: "border-color .3s, background .3s, color .3s",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
                style={{ flex: "0 0 auto" }}
              >
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.14a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.69-8.23 8.23-8.23 4.53 0 8.22 3.69 8.22 8.23 0 4.53-3.69 8.23-8.23 8.23z" />
              </svg>
              Scrie-ne pe WhatsApp
            </a>
          </div>
          <div style={{ gridArea: "contact" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--rl)",
                    fontSize: 9,
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    color: "#8b6914",
                    flex: "0 0 90px",
                  }}
                >
                  Telefon
                </span>
                <p
                  style={{
                    fontFamily: "var(--pd)",
                    fontSize: 20,
                    lineHeight: 1.3,
                    margin: 0,
                    fontFeatureSettings: "'tnum' 1",
                  }}
                >
                  <a href="tel:+40765080667">0765 080 667</a>
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--rl)",
                    fontSize: 9,
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    color: "#8b6914",
                    flex: "0 0 90px",
                  }}
                >
                  Email
                </span>
                <p
                  style={{
                    fontFamily: "var(--cg)",
                    fontSize: 18,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  <a href="mailto:contact@thehunter.ro">contact@thehunter.ro</a>
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              <a
                href="https://facebook.com/thehunterhouse"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="thm-social"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.3-1.5 1.6-1.5H16.5V4.3C16.1 4.2 15.1 4 14 4c-2.4 0-4 1.5-4 4.2v2.3H7.5v3H10V21h3.5z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/thehunterhouse"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="thm-social"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@thehunterhouse"
                target="_blank"
                rel="noopener"
                aria-label="TikTok"
                className="thm-social"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.5 3c.4 2 1.8 3.6 3.8 4v3c-1.5 0-2.9-.4-4.1-1.2v6.4c0 3.2-2.6 5.8-5.8 5.8S4.6 18.4 4.6 15.2 7.2 9.4 10.4 9.4c.3 0 .6 0 .9.1v3.1c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V3h3.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        </div>
      </section>

      <footer
        style={{
          padding: "36px var(--pad)",
          background: "var(--dark2)",
          borderTop: "1px solid rgba(201,168,76,0.18)",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px 40px",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--rl)",
          fontSize: 10,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(245,240,232,0.45)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--pd)",
            fontSize: 14,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--ivory)",
          }}
        >
          The Hunter{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Meridian</em>
        </span>
        <span
          style={{
            width: "auto",
            color: "rgba(245,240,232,0.35)",
            letterSpacing: "0.15em",
            textTransform: "none",
            fontSize: 11,
          }}
        >
          © 2026 The Hunter. Toate drepturile rezervate.
        </span>
      </footer>
    </div>
  )
}
