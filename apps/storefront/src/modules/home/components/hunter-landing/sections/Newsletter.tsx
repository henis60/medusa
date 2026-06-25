"use client"

import { useState } from "react"
import Script from "next/script"

const RECAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "6LdnohktAAAAAOnmNaDbJ1bBeKx3irV5qgeqoOI5"

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

type Status = "idle" | "loading" | "success" | "error"

const Newsletter = () => {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const email = (new FormData(e.currentTarget).get("EMAIL") as string)?.trim()

    try {
      const recaptchaToken = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(RECAPTCHA_SITEKEY, { action: "newsletter" })
            .then(resolve)
            .catch(reject)
        })
      })

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/newsletter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
          },
          body: JSON.stringify({ email, recaptchaToken }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(
          json.error || "Înscrierea nu a putut fi finalizată. Încearcă din nou."
        )
        setStatus("error")
        return
      }

      setStatus("success")
    } catch {
      setErrorMsg("Înscrierea nu a putut fi finalizată. Încearcă din nou.")
      setStatus("error")
    }
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITEKEY}`}
        strategy="lazyOnload"
      />

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

                {status === "success" ? (
                  <div
                    style={{
                      background: "rgba(27,77,62,0.3)",
                      border: "1px solid rgba(201,168,76,0.35)",
                      padding: "12px 14px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--rl)",
                        fontSize: "11px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "rgba(232,213,163,0.85)",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      Mulțumim! Te-ai înscris cu succes.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: "flex" }}>
                      <input
                        type="email"
                        id="EMAIL"
                        name="EMAIL"
                        autoComplete="email"
                        placeholder="adresa@email.com"
                        required
                        className="newsletter-email-input"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: "var(--rl)",
                          fontSize: "16px",
                          letterSpacing: "2px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(201,168,76,0.25)",
                          borderRight: "none",
                          color: "var(--ivory)",
                          padding: "0 14px",
                          height: "44px",
                          outline: "none",
                          caretColor: "var(--gold)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(201,168,76,0.65)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(201,168,76,0.25)")
                        }
                      />
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        style={{
                          flexShrink: 0,
                          fontFamily: "var(--rl)",
                          fontSize: "11px",
                          letterSpacing: "4px",
                          textTransform: "uppercase",
                          color: "var(--dark)",
                          background: "var(--gold)",
                          border: "none",
                          padding: "0 20px",
                          height: "44px",
                          cursor: status === "loading" ? "default" : "pointer",
                          opacity: status === "loading" ? 0.55 : 1,
                          transition: "opacity 0.3s",
                        }}
                      >
                        {status === "loading" ? "..." : "Înscrie-mă"}
                      </button>
                    </div>

                    {status === "error" && (
                      <div
                        style={{
                          marginTop: "8px",
                          background: "rgba(114,47,55,0.22)",
                          border: "1px solid rgba(139,69,19,0.5)",
                          padding: "10px 14px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--rl)",
                            fontSize: "11px",
                            letterSpacing: "2px",
                            color: "rgba(232,213,163,0.85)",
                            margin: 0,
                            textAlign: "center",
                          }}
                        >
                          {errorMsg}
                        </p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Newsletter
