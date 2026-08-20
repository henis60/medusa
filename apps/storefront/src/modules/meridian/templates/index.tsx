import Image from "next/image"

import Nav from "@modules/layout/templates/nav"
import HeroEyebrow from "../components/hero-eyebrow"
import BileteNavLink from "../components/bilete-nav-link"
import HashScrollFix from "../components/hash-scroll-fix"
import MeridianCanvas from "../components/meridian-canvas"
import ProgramRows from "../components/program-rows"
import Reveal from "../components/reveal"
import SmoothAnchorLink from "../components/smooth-anchor-link"
import SponsorMarquee from "../components/sponsor-marquee"
import ThemeTimeline from "../components/theme-timeline"
import { montigny } from "../fonts"

const TICKET_INCLUDES = [
  "Acces la expoziția celor zece automobile",
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
  border: "1px solid transparent",
  fontFamily: "var(--rl)",
  fontSize: 10,
  letterSpacing: "0.6em",
  textTransform: "uppercase",
} as const

export default function MeridianTemplate() {
  return (
    <div className="thm-root">
      <HashScrollFix />
      <Nav
        rightAction={<BileteNavLink />}
        logoHref="/meridian"
        logoSuffix={
          <>
            {" "}
            <em
              className={`not-italic normal-case text-hunter-gold tracking-tight text-[28px] ${montigny.className}`}
            >
              Meridian
            </em>
          </>
        }
      />
      <div className="thm-hero-shell">
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
            justifyContent: "center",
            padding: "clamp(40px,7vw,80px) var(--pad) clamp(56px,9vw,96px)",
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
            <div
              className="thm-hero-content"
              style={{ position: "relative", maxWidth: 1360, margin: "0 auto" }}
            >
              <HeroEyebrow />
              <h1
                className="thm-hero-title"
                style={{
                  fontFamily: "var(--pd)",
                  fontWeight: 400,
                  fontSize: "clamp(46px,6vw,86px)",
                  lineHeight: 1.06,
                  color: "var(--ivory)",
                  margin: 0,
                  maxWidth: "20ch",
                }}
              >
                The Hunter{" "}
                <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                  Meridian
                </em>
              </h1>
              <p
                className="thm-hero-copy"
                style={{
                  fontFamily: "var(--cg)",
                  fontSize: "clamp(20px,2vw,26px)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  color: "rgba(245,240,232,0.9)",
                  maxWidth: "48ch",
                  margin: "34px 0 0",
                }}
              >
                Meridianul pe care eleganța Vestului își găsește rădăcini în
                Est.
              </p>
              <p
                style={{
                  fontFamily: "var(--cg)",
                  fontSize: "clamp(15px,1.3vw,17px)",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(232,213,163,0.6)",
                  maxWidth: "56ch",
                  margin: "22px 0 0",
                }}
              >
                Zece automobile în cinci perechi clasic–contemporan, un concert
                de blues &amp; jazz în aer liber, o expoziție de pictură și
                sculptură și trei colecții noi The Hunter House, într-o singură
                zi, la Colonia Pictorilor.
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
                  href="https://www.iabilet.ro"
                  target="_blank"
                  rel="noopener"
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
                <SmoothAnchorLink
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
                  <span
                    style={{ fontSize: 15, color: "rgba(201,168,76,0.55)" }}
                  >
                    →
                  </span>
                </SmoothAnchorLink>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Sponsors marquee */}
        <section
          aria-label="Sponsori și parteneri"
          style={{
            padding: "clamp(12px,1.4vw,18px) 0",
            background: "#0d1f17",
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
            <div className="thm-concept-grid">
              <div className="thm-concept-textwrap">
                <div className="thm-concept-lead" style={eyebrowRow}>
                  <span style={eyebrowRule} />
                  <span style={eyebrowLabel}>Conceptul</span>
                </div>
                <h2
                  className="thm-concept-lead thm-concept-heading"
                  style={{
                    ...sectionHeading,
                    margin: "0 0 40px",
                    maxWidth: "24ch",
                  }}
                >
                  O tradiție{" "}
                  <em style={{ fontStyle: "italic", color: "#c9a84c" }}>
                    în devenire.
                  </em>
                </h2>
                <p
                  className="thm-concept-para"
                  style={{
                    fontFamily: "var(--cg)",
                    fontSize: 17,
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: "rgba(245,240,232,0.7)",
                    margin: 0,
                  }}
                >
                  Hunter vine din vechea engleză huntian — a urmări cu un scop
                  anume. Meridian, din latinescul meridies, e linia care setează
                  un punct comun între emisfere. Împreună, devin linia de ochire
                  a unui standard occidental de gust, urmărit pe traseul dintre
                  Est și Vest — cel pe care Londra, Parisul și Viena îl trasau
                  acum un secol, cu accent local la fiecare curte care îl purta.
                </p>
                <p
                  className="thm-concept-para"
                  style={{
                    fontFamily: "var(--cg)",
                    fontSize: 17,
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: "rgba(245,240,232,0.7)",
                    margin: "20px 0 0",
                  }}
                >
                  Legătura aceea nu s-a rupt, doar s-a subțiat pentru o vreme.
                  The Hunter Meridian o reia: un reper anual, cu temă și piese
                  noi la fiecare ediție — Ediția I, evoluția automobilului de la
                  clasic la contemporan. Fiecare invitat, fie om de succes care
                  a văzut deja Ascot sau Saint-Tropez, fie om de cultură care
                  recunoaște o operă, aduce cu el o bucată din același meridian.
                </p>
                <blockquote
                  className="thm-concept-quote"
                  style={{
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
                  Un meridian unește lumile, chiar le conectează.
                </blockquote>
              </div>
              <div
                className="thm-concept-canvas"
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  maxWidth: 380,
                  margin: "0 auto",
                  width: "100%",
                }}
              >
                <MeridianCanvas />
              </div>
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
              Zece automobile, cinci perechi: aceleași mărci, separate de șase
              decenii, expuse față în față.
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
                Operă de artă unicat, din doar 5 exemplare existente în lume,
                atestată oficial de Lamborghini.Prima expunere publică în
                România. Cu mult înaintea supercar-urilor, Ferruccio Lamborghini
                construia tractoare. Aici a început totul.
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
                Lângă el așezăm un Lamborghini Aventador SVJ, care spune
                cealaltă parte a aceleiași povești: ce a crescut în șaizeci de
                ani din tractorul acela — Old Money și New Rich, două momente
                ale aceleiași istorii. Clasicismul se poate finanța, nu se poate
                cumpăra: ține de timp, nu de bani. Tractorul e acolo să
                amintească ce anume susține valoarea mașinii de lângă el.
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
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3 / 2",
                }}
              >
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
      <section
        id="program"
        className="thm-anchor-target"
        style={{ background: "var(--dark2)" }}
      >
        <ProgramRows />
      </section>

      {/* Bilete */}
      <section
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
                className="thm-ticket-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "14px 40px",
                }}
              >
                {TICKET_INCLUDES.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flex: "0 0 auto",
                        fontSize: 5,
                        color: "#8b6914",
                        marginTop: 6,
                      }}
                    >
                      ◆
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--cg)",
                        fontSize: 13,
                        fontStyle: "italic",
                        fontWeight: 300,
                        lineHeight: 1.6,
                        color: "rgba(245,240,232,0.6)",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="thm-hero-cta-row"
              style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
            >
              <a
                href="https://www.iabilet.ro"
                target="_blank"
                rel="noopener"
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
            </div>
          </div>
        </Reveal>
      </section>

      {/* Locația */}
      <section id="locatia" style={{ background: "var(--dark)" }}>
        <div className="thm-locatia-row">
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
              className="thm-locatia-overlay"
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                padding: "clamp(20px,3.5vw,40px) var(--pad)",
                pointerEvents: "none",
              }}
            >
              <div style={{ maxWidth: 1360, margin: "0 auto" }}>
                <div style={{ maxWidth: 640, pointerEvents: "auto" }}>
                  <div style={{ ...eyebrowRow, marginBottom: 12 }}>
                    <span style={eyebrowRule} />
                    <span
                      style={{
                        ...eyebrowLabel,
                        color: "rgba(201,168,76,0.85)",
                      }}
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
                    O locație cu tradiție în artă, la 20 de minute de centrul
                    Băii Mari: verde, clădiri de epocă, ateliere care
                    funcționează și astăzi. Spațiu generos în aer liber, cu zonă
                    acoperită, scenă pentru concert și parcare amplă.
                  </p>
                </div>
              </div>
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
        </div>
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
              <p
                style={{
                  fontFamily: "var(--cg)",
                  fontSize: 17,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(245,240,232,0.7)",
                  maxWidth: "42ch",
                  margin: "18px 0 0",
                }}
              >
                Ești interesat de mai multe detalii sau de un parteneriat cu The
                Hunter Meridian? Scrie-ne și îți răspundem în cel mai scurt
                timp.
              </p>
            </div>
            <div style={{ gridArea: "contact", alignSelf: "end" }}>
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
                    <a href="mailto:contact@thehunter.ro">
                      contact@thehunter.ro
                    </a>
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
                  Socials
                </span>
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
                    <circle
                      cx="17.2"
                      cy="6.8"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
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
              <a
                href="https://wa.me/40765080667"
                target="_blank"
                rel="noopener"
                className="thm-btn-outline thm-whatsapp-cta"
                style={{
                  marginTop: 28,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  height: 50,
                  minWidth: 260,
                  boxSizing: "border-box",
                  border: "1px solid rgba(201,168,76,0.45)",
                  padding: "0 32px",
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
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: "0 0 auto" }}
                >
                  <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
                  <path d="M8.6 8.7c-.15.5.1 1.1.6 1.9.6 1 1.4 1.8 2.4 2.4.8.5 1.4.7 1.9.6.4-.1.9-.5 1-.9l.1-.4" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "36px var(--pad)",
          background: "var(--dark2)",
          borderTop: "1px solid rgba(201,168,76,0.18)",
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: "0 auto",
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
            <em
              className={montigny.className}
              style={{
                fontStyle: "normal",
                textTransform: "none",
                color: "var(--gold)",
                fontSize: 20,
              }}
            >
              Meridian
            </em>
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
        </div>
      </footer>
    </div>
  )
}
