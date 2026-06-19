import LocalizedClientLink from "@modules/common/components/localized-client-link"

const MARQUEE_ITEMS = [
  "Tailoring Premium",
  "Made to Measure",
  "The Hunter Bar",
  "Heritage & Vânătoare",
  "Friday Social Club",
  "Ready to Wear",
  "Atelier Privat",
  "Vinuri & Cocktailuri",
  "Events",
  "Membership",
  "Est. 2024",
]

const Hero = () => {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <section className="hero" id="home">
      <div className="hero-bg" id="heroBg" aria-hidden="true" />

      <div className="hero-grid" aria-hidden="true">
        <div className="hgl" />
        <div className="hgl" />
        <div className="hgl" />
        <div className="hgl" />
        <div className="hgl" />
      </div>

      <div className="scan-line" aria-hidden="true" />

      {/* Hero content */}
      <div className="hero-content">
        <div className="hero-top-group">
          <div className="eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">
              Return of the Elegant Gentleman
            </span>
            <div className="eyebrow-line" />
          </div>

          <div className="hero-logo">
            <div className="logo-l1">
              {"THE HUNTER".split("").map((ch, i) => (
                <span
                  key={i}
                  className="char"
                  style={{ animationDelay: `${0.3 + i * 0.04}s` }}
                >
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </div>
            <div className="logo-l2">
              {"house".split("").map((ch, i) => (
                <span
                  key={i}
                  className="char"
                  style={{ animationDelay: `${0.55 + i * 0.045}s` }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <div className="orn">
            <div className="orn-line" />
            <div className="orn-gem" />
            <div className="orn-line r" />
          </div>

          <div>
            <span className="eyebrow-text">online shop</span>
          </div>
        </div>
        {/* end hero-top-group */}

        <LocalizedClientLink href="/store" className="hero-cta">
          <span className="hero-cta-text">Explorează Colecția</span>
          <span className="hero-cta-arrow">→</span>
        </LocalizedClientLink>
      </div>

      <div
        className="mqstrip"
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 4,
        }}
      >
        <div className="mqinner">
          {items.map((label, i) => (
            <div className="mqitem" key={i}>
              {label} <span className="mqgem">◆</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
