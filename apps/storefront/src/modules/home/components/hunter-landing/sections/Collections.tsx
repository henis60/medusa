"use client"

export default function Collections() {
  const collections = [
    {
      id: "mtm",
      tag: "Serviciu principal",
      name: "Made to Measure",
      highlighted: "Measure",
      sub: "Costumul care se construiește pe tine – nu invers.",
      image: "/landing/images/mtm.webp",
      tall: true,
    },
    {
      id: "hunting",
      tag: "Colecție exclusivă · Toamnă 2026",
      name: "Vânătoare & Ecvestru",
      highlighted: "Ecvestru",
      sub: "Harris Tweed, lână tradițională britanică. Pentru bărbatul care știe că o dimineață bună de toamnă merită haine pe măsura ei.",
      image: "/landing/images/vanatoare.webp",
    },
    {
      id: "rtw",
      tag: "Colecție permanentă",
      name: "Ready to Wear",
      highlighted: "Wear",
      sub: "Piese selectate cu exigența unui tailor. Disponibile imediat.",
      image: "/landing/images/ready-to-wear.webp",
    },
  ]

  const mtmSteps = [
    {
      num: "01",
      name: "Consultație",
      desc: "Discutăm stilul, ocaziile, preferințele. Primul pas spre costumul care te definește.",
    },
    {
      num: "02",
      name: "Material",
      desc: "Alegi din colecția noastră de țesături premium – Super 100 până la Super 180, din cele mai bune manufacture europene.",
    },
    {
      num: "03",
      name: "Măsuri",
      desc: "Luăm toate măsurile necesare. Construim tiparul unic pe corpul tău – nu pe o talie standard.",
    },
    {
      num: "04",
      name: "Fitting",
      desc: "Fitting intermediar pentru ajustări perfecte înainte de finisare. Fiecare detaliu, perfect.",
    },
    {
      num: "05",
      name: "Livrare",
      desc: "Costumul tău gata în 21 de zile. Livrat în sacul de protecție The Hunter House.",
    },
  ]

  return (
    <section className="section coll-sec" id="collections">
      <div className="section-inner">
        <div className="kicker rv">
          <span className="kicker-bar"></span>Collections
        </div>
        <h2 className="sec-title rv">
          Pentru fiecare
          <br />
          versiune a <em>ta</em>
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
                {collections[0].name.split(" ")[0]}{" "}
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
                    {coll.id === "hunting" ? "Vânătoare & " : coll.name.split(" ")[0] + " "}
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
        <div
          className="mtm-inline rv-group"
          style={{ transitionDelay: "0.15s" }}
        >
          <div className="mtm-inline-header rv">
            <div className="mtm-tag">Made to measure</div>
            <h3 className="mtm-inline-title">
              Costumul tău nu se găsește –<br />
              <em>se construiește.</em>
            </h3>
          </div>
          <div className="mtm-steps">
            {mtmSteps.map((step) => (
              <div key={step.num} className="mtm-step">
                <div className="ms-num">{step.num}</div>
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
