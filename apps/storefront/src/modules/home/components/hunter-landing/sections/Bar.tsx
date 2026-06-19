"use client"

export default function Bar() {
  return (
    <div className="bar-band" id="bar">
      <div className="bar-band-bg" id="band2"></div>
      <div className="bar-content">
        <div className="kicker rv">
          <span className="kicker-bar"></span>Wine &amp; cocktails
        </div>
        <h2 className="bar-title rv">
          The Hunter<br />
          <em>Bar</em>
        </h2>
        <p className="bar-body rv">
          Selecție atentă de whisky, gin, vinuri și cocktailuri clasice. Fiecare
          sticlă aleasă cu grijă. Fiecare seară cu un ritm al ei.
        </p>
        <div className="flex rv" style={{ transitionDelay: "0.12s" }}>
          <div className="bs">
            <div className="bs-num count-num" data-target="80" data-suffix="+">
              0
            </div>
            <div className="bs-lbl">Referințe de vin</div>
          </div>
          <div className="bs">
            <div className="bs-num count-num" data-target="6">
              0
            </div>
            <div className="bs-lbl">Cocktailuri signature</div>
          </div>
        </div>
      </div>
    </div>
  )
}
