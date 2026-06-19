"use client"

export default function GiftCard() {
  const amounts = ["300 lei", "500 lei", "1.000 lei", "2.000 lei"]

  return (
    <section className="section gc-sec" id="giftcard">
      <div className="section-inner">
        <div className="gc-wrap">
          <div className="relative flex items-center justify-center rv from-l">
            <div className="gc-card" id="gcCard">
              <div className="gc-card-logo">
                <div className="gc-logo-1">The Hunter</div>
                <div className="gc-logo-divider"></div>
                <div className="gc-logo-2">House</div>
              </div>
              <div className="gc-card-amount" id="gcCardAmount">
                300 lei
              </div>
            </div>
          </div>
          <div className="rv">
            <div className="kicker">
              <span className="kicker-bar"></span>Gift Card
            </div>
            <h2 className="sec-title">
              Cadoul perfect
              <br />
              pentru un <em>gentleman.</em>
            </h2>
            <p className="gc-desc">
              Un card cadou The Hunter House poate fi folosit pentru orice
              serviciu – Made to Measure, Ready to Wear, consultație de stil sau
              o seară la The Hunter Bar.
            </p>
            <div className="gc-amounts" id="gcAmounts">
              {amounts.map((amount, idx) => (
                <div
                  key={amount}
                  className={`gc-amt ${idx === 0 ? "on" : ""}`}
                  onClick={(e) => {
                    if (
                      typeof window !== "undefined" &&
                      (window as any).selGc
                    ) {
                      ;(window as any).selGc(e.currentTarget)
                    }
                  }}
                >
                  <span>{amount}</span>
                </div>
              ))}
            </div>
            <div className="gc-note">
              Valabil 12 luni · Disponibil fizic sau digital · Personalizabil
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
