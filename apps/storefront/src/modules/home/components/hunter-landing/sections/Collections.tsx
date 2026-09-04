"use client"

import { useTranslations } from "next-intl"

export default function Collections() {
  const t = useTranslations("home")

  const collections = [
    {
      id: "mtm",
      tag: t("Serviciu principal"),
      name: t("Made to Measure"),
      highlighted: "Measure",
      sub: t("Costumul care se construiește pe tine – nu invers"),
      image: "/landing/images/mtm.webp",
      tall: true,
    },
    {
      id: "hunting",
      tag: t("Colecție exclusivă · Toamnă 2026"),
      name: t("Vânătoare & Ecvestru"),
      highlighted: t("Vânătoare & Ecvestru").split(" ").slice(-1)[0],
      sub: t("Harris Tweed, lână tradițională britanică Pentru bărbatul care știe că o dimineață bună de toamnă merită haine pe măsura ei"),
      image: "/landing/images/vanatoare.webp",
    },
    {
      id: "rtw",
      tag: t("Colecție permanentă"),
      name: t("Ready to Wear"),
      highlighted: "Wear",
      sub: t("Piese selectate cu exigența unui tailor Disponibile imediat"),
      image: "/landing/images/ready-to-wear.webp",
    },
  ]

  const mtmSteps = [
    { name: t("Consultație"), desc: t("Discutăm stilul, ocaziile, preferințele Primul pas spre costumul care te definește") },
    { name: t("Material"), desc: t("Alegi din colecția noastră de țesături premium – Super 100 până la Super 180, din cele mai bune manufacture europene") },
    { name: t("Măsuri"), desc: t("Luăm toate măsurile necesare Construim tiparul unic pe corpul tău – nu pe o talie standard") },
    { name: t("Fitting"), desc: t("Fitting intermediar pentru ajustări perfecte înainte de finisare Fiecare detaliu, perfect") },
    { name: t("Livrare"), desc: t("Costumul tău gata în 21 de zile Livrat în sacul de protecție The Hunter House") },
  ]

  return (
    <section className="section coll-sec" id="collections">
      <div className="section-inner">
        <div className="kicker rv">
          {t("Collections")}
        </div>
        <h2 className="sec-title rv">
          {t("Pentru fiecare")}
          <br />
          {t("versiune a")} <em>{t("ta")}</em>
        </h2>
        <div className="line-draw rv" style={{ maxWidth: "280px" }}></div>

        <div className="coll-grid rv-group">
          {/* Made to Measure - tall card */}
          <div className="coll-card coll-card-tall">
            <div
              className="coll-bg-img coll-bg-img--left"
              style={{
                backgroundImage: `url("${collections[0].image}")`,
                backgroundPosition: "center center",
              }}
            ></div>
            <div className="coll-overlay"></div>
            <div className="coll-info">
              <div className="coll-tag">{collections[0].tag}</div>
              <div className="coll-name">
                {collections[0].name
                  .slice(0, collections[0].name.lastIndexOf(collections[0].highlighted))
                  .trim()}{" "}
                <em>{collections[0].highlighted}</em>
              </div>
              <p className="coll-sub">{collections[0].sub}</p>
            </div>
          </div>

          {/* Right stack */}
          <div className="coll-right-stack">
            {collections.slice(1).map((coll) => (
              <div key={coll.id} className="coll-card">
                <div
                  className="coll-bg-img"
                  style={{
                    backgroundImage: `url("${coll.image}")`,
                    backgroundPosition: "center center",
                  }}
                ></div>
                <div className="coll-overlay"></div>
                <div className="coll-info">
                  <div className="coll-tag">{coll.tag}</div>
                  <div className="coll-name">
                    {coll.id === "hunting"
                      ? coll.name.split(" ").slice(0, -1).join(" ") + " "
                      : coll.name.slice(0, coll.name.lastIndexOf(coll.highlighted)).trim() + " "}
                    {coll.id !== "hunting" && <em>{coll.highlighted}</em>}
                    {coll.id === "hunting" && (
                      <>
                        <br />
                        <em>{coll.highlighted}</em>
                      </>
                    )}
                  </div>
                  <p className="coll-sub">{coll.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MtM Process */}
        <div className="mtm-inline rv-group">
          {/* No "rv" here: this is already a direct child of the .rv-group
              above, which independently animates each of its children via a
              staggered opacity/transform tween. Also having "rv" made this
              element match the reveal effect's top-level ".rv" selector too,
              so two competing WAAPI animations fought over its opacity at
              once — the flicker (visible → vanish → reappear) described
              elsewhere in hunter-landing/index.tsx as this exact bug class. */}
          <div className="mtm-inline-header">
            <div className="mtm-tag">{t("Made to measure")}</div>
            <h3 className="mtm-inline-title">
              {t("Costumul tău nu se găsește –")}
              <br />
              <em>{t("se construiește")}</em>
            </h3>
          </div>
          <div className="mtm-steps">
            {mtmSteps.map((step) => (
              <div key={step.name} className="mtm-step">
                <div className="ms-name">{step.name}</div>
                <p className="ms-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
