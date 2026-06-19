"use client"

export default function Space() {
  const zones = [
    {
      id: "z1",
      glyph: "S",
      name: "Salon",
      tag: "Zona principală",
      title: "Salon Principal",
      highlighted: "Principal",
      desc: "Pian cu coadă în centru. Canapele din piele cognac. Panouri tartan Royal Stewart. Candelabre de alamă. Covor persan.",
    },
    {
      id: "z2",
      glyph: "B",
      name: "Bar",
      tag: "The Hunter Bar",
      title: "Sanctuarul gustului",
      highlighted: "Sanctuarul",
      desc: "80+ referințe de vin. 6 cocktailuri signature. Whisky, gin și spirtoase alese personal. Blat dark walnut.",
    },
    {
      id: "z3",
      glyph: "A",
      name: "Atelier",
      tag: "Made to Measure",
      title: "Atelier privat",
      highlighted: "privat",
      desc: "200+ eșantioane de țesături Super 100–180. Consultație individuală. Costumul tău în 21 de zile.",
    },
    {
      id: "z4",
      glyph: "F",
      name: "Fitting",
      tag: "Fitting Room",
      title: "Oglinda adevărului",
      highlighted: "adevărului",
      desc: "Oglindă triplu-panou. Iluminat calibrat. Intimitate totală. Ajustări finale pe loc.",
    },
    {
      id: "z5",
      glyph: "L",
      name: "Lounge",
      tag: "Membership Gold · Black",
      title: "Lounge Privat",
      highlighted: "Privat",
      desc: "Rezervat exclusiv membrilor. Întâlniri private, degustări exclusive și momente care nu se publică.",
    },
  ]

  return (
    <section className="space-sec" id="space">
      <div className="zones rv" style={{ transitionDelay: "0.12s" }}>
        {zones.map((zone) => (
          <div key={zone.id} className={`zone ${zone.id}`}>
            <div className="zone-bg"></div>
            <div className="zone-tex"></div>
            <div className="zone-grad"></div>
            <div className="zone-glyph">{zone.glyph}</div>
            <div className="zone-collapsed">
              <span className="zone-vname">{zone.name}</span>
            </div>
            <div className="zone-expanded">
              <div className="zone-tag">{zone.tag}</div>
              <div className="zone-title">
                {zone.id === "z2" && <em>{zone.highlighted}</em>}
                {zone.id !== "z2" && (
                  <>
                    {zone.title.replace(zone.highlighted, "")} <em>{zone.highlighted}</em>
                  </>
                )}
                {zone.id === "z2" && (
                  <> gustului</>
                )}
              </div>
              <p className="zone-desc">{zone.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
