"use client"

import RouteCanvas from "./RouteCanvas"

export default function About() {
  const pillars = [
    {
      num: "01",
      name: "Tailoring",
      desc: "Made to Measure și Ready to Wear — costume construite pe corpul tău.",
    },
    {
      num: "02",
      name: "The Hunter Bar",
      desc: "Selecție de vinuri rare, cocktailuri clasice și spirtoase premium. Un sanctuar al gustului, cu atmosferă unică.",
    },
    {
      num: "03",
      name: "Comunitate Privată",
      desc: "Friday Social Club — un cerc select de antreprenori, reuniți pentru degustare de vin, pian live și conversații care contează.",
    },
    {
      num: "04",
      name: "Heritage & Vânătoare",
      desc: "Colecție exclusivă în stil britanic — Harris Tweed, lână tradițională, croieli cu caracter. Eleganța unui alt timp.",
    },
  ]

  return (
    <div className="about-wrap" id="about">
      <div className="about-photo">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <RouteCanvas />
          <div className="dviz-vignette"></div>
        </div>
        <div
          className="photo-badge rv scale-in"
          style={{ display: "none" }}
        ></div>
        <div className="absolute bottom-5 right-5 z-[3] text-right">
          <div className="dviz-caption-title">Inspirație</div>
          <div className="dviz-caption-sub">
            Londra · Milano · Paris · Viena · Zurich
          </div>
        </div>
      </div>
      <div className="about-text-col">
        <div className="about-bg-glyph">H</div>
        <div className="kicker rv">
          <span className="kicker-bar"></span>Origin
        </div>
        <h2 className="sec-title rv">
          The Hunter
          <br />
          <em>House</em>
        </h2>
        <p className="sec-body-text rv">
          Singurul concept de lifestyle masculin din România care reunește
          tailoring premium, The Hunter Bar cu cramă proprie de vinuri, și o
          comunitate privată selectivă.
        </p>
        <div className="pillars rv-group">
          {pillars.map((pillar) => (
            <div key={pillar.num} className="pillar">
              <div className="pl-num">{pillar.num}</div>
              <div>
                <div className="pl-name">{pillar.name}</div>
                <p className="pl-desc">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
