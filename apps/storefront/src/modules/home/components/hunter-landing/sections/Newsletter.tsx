"use client"

const SIB_ACTION =
  "https://b60ca609.sibforms.com/serve/MUIFABnLeIVBiNDYjugER1w9e_5OMy4RYz3XIjauRsywkqdwaUohH3b2HR7Z-WsXfyApTOThUJMaKdm5vme6diqQBuJolfdu3xvsojOvA0cHNy-Y-vNE8OiagH71kRFloHJvB98THxPrsbMDp1MDLLBwwCbkbPTUgSe0bks4vdVtytzrpGqCljT6K1uFJqTH4dQyjPMXU8gtxic6DQ=="
const RECAPTCHA_SITEKEY = "6LdnohktAAAAAOnmNaDbJ1bBeKx3irV5qgeqoOI5"

const Newsletter = () => {
  return (
    <section className="section subscribe-sec" id="subscribe">
      <div className="section-inner">
        <div className="subscribe-layout">
          <div className="subscribe-copy">
            <div className="kicker rv">
              <span className="kicker-bar" />
              Newsletter
            </div>
            <h2 className="sec-title subscribe-title rv">
              Noutăți și <em>colecții noi</em>
            </h2>
            <p className="sec-body-text subscribe-body rv">
              Un email când lansăm. Apoi, doar ce merită citit.
            </p>
            <div className="line-draw subscribe-rule rv" />
            <p className="subscribe-note rv">
              Niciun spam. Te poți dezabona oricând.
            </p>
          </div>

          <div className="subscribe-form-wrap rv">
            <div className="subscribe-panel">
              <p className="subscribe-panel-label">Abonare rapidă</p>
              <p className="subscribe-panel-copy">
                Primești lansări, evenimente și colecții noi înaintea tuturor.
              </p>

              <div
                id="sib-form-container"
                className="sib-form-container subscribe-form"
              >
                <div
                  id="success-message"
                  className="sib-form-message-panel"
                  style={{ display: "none" }}
                >
                  <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                    <span className="sib-form-message-panel__inner-text">
                      Mulțumim! Te-ai înscris cu succes pe lista noastră.
                    </span>
                  </div>
                </div>

                <div
                  id="sib-container"
                  className="sib-container--large sib-container--vertical"
                >
                  <form
                    id="sib-form"
                    method="POST"
                    action={SIB_ACTION}
                    data-type="subscription"
                  >
                    <div className="flex gap-0 items-stretch">
                      <div className="sib-input sib-form-block flex-1 min-w-0">
                        <div className="form__entry entry_block">
                          <div className="form__label-row">
                            <div className="entry__field">
                              <input
                                className="input"
                                type="text"
                                id="EMAIL"
                                name="EMAIL"
                                autoComplete="email"
                                placeholder="adresa@email.com"
                                data-required="true"
                                required
                              />
                            </div>
                          </div>
                          <label className="entry__error entry__error--primary" />
                        </div>
                      </div>

                      <div className="sib-form-block shrink-0">
                        <button
                          className="sib-form-block__button sib-form-block__button-with-loader"
                          form="sib-form"
                          type="submit"
                        >
                          Înscrie-mă
                        </button>
                      </div>
                    </div>

                    <div
                      id="error-message"
                      className="sib-form-message-panel"
                      style={{ display: "none" }}
                    >
                      <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                        <span className="sib-form-message-panel__inner-text">
                          Înscrierea nu a putut fi finalizată. Încearcă din nou.
                        </span>
                      </div>
                    </div>

                    <div
                      className="g-recaptcha-v3"
                      data-sitekey={RECAPTCHA_SITEKEY}
                      style={{ display: "none" }}
                    />
                    <input
                      type="text"
                      name="email_address_check"
                      defaultValue=""
                      className="input--hidden"
                      style={{ display: "none" }}
                    />
                    <input type="hidden" name="locale" defaultValue="ro" />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
