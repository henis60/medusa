"use client"

export default function Membership() {
  const tiers = [
    {
      id: "silver",
      name: "Silver",
      price: "500",
      tag: "",
      perks: [
        "Acces Friday Social Club",
        "1 sesiune de stil / an",
        "5% discount Ready to Wear",
        "Early access colecții noi",
        "Newsletter exclusiv",
      ],
    },
    {
      id: "gold",
      name: "Gold",
      price: "900",
      tag: "Recomandat",
      featured: true,
      perks: [
        "Tot ce include Silver",
        "2 sesiuni de stil / an",
        "10% discount Made to Measure",
        "Rezervare privată bar",
        "Voucher 150 lei / an",
        "Invitație evenimente speciale",
      ],
    },
    {
      id: "black",
      name: "Black",
      price: "1.800",
      tag: "",
      perks: [
        "Tot ce include Gold",
        "Sesiuni de stil nelimitate",
        "15% discount toate serviciile",
        "Acces lounge privat",
        "Voucher 400 lei / an",
        "First seat Friday Social Club",
        "Concierge personal",
      ],
    },
  ]

  return (
    <section className="section mem-sec" id="membership">
      <div className="section-inner">
        <div className="kicker rv">
          <span className="kicker-bar"></span>Membership
        </div>
        <h2 className="sec-title rv">
          The Hunter
          <br />
          <em>Club</em>
        </h2>
        <p className="sec-body-text rv" style={{ marginBottom: "0" }}>
          Membership-ul The Hunter nu este un card de loialitate. Este o
          invitație să faci parte dintr-o comunitate selectivă cu acces la
          experiențe unice.
        </p>
        <div
          className="line-draw rv"
          style={{ marginTop: "20px", maxWidth: "320px" }}
        ></div>
        <div className="mem-grid rv-group">
          {tiers.map((tier) => (
            <div key={tier.id} className={`mem ${tier.featured ? "feat" : ""}`}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <div className="mem-tag">{tier.tag}</div>
              </div>
              <div className="mem-name">{tier.name}</div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <div className="mem-price">{tier.price}</div>
                <div className="mem-psub">lei / an</div>
              </div>
              <div className="mem-div"></div>
              <div className="flex flex-col gap-1.5 pt-2">
                {tier.perks.map((perk, idx) => (
                  <div key={idx} className="mem-perk">
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
