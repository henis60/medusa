"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const TABS = [
  { view: LOGIN_VIEW.SIGN_IN, label: "Autentificare" },
  { view: LOGIN_VIEW.REGISTER, label: "Înregistrare" },
]

type Props = {
  redirectTo?: string
}

const LoginTemplate = ({ redirectTo }: Props) => {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.SIGN_IN)

  const showTabs = currentView !== LOGIN_VIEW.FORGOT_PASSWORD

  return (
    <div className="flex flex-col min-h-[60vh]">
      {currentView === LOGIN_VIEW.FORGOT_PASSWORD && (
        <div className="page-container pt-3 small:pt-6 pb-0">
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="inline-flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-gold)] transition-colors font-sans text-[11px] uppercase tracking-[3px]"
          >
            <span>←</span>
            <span>Înapoi la autentificare</span>
          </button>
        </div>
      )}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
        <div className="w-full max-w-sm">
          {showTabs && (
            <div className="flex border-b border-[var(--theme-border)] mb-10">
              {TABS.map((tab) => {
                const active = currentView === tab.view
                return (
                  <button
                    key={tab.view}
                    onClick={() => setCurrentView(tab.view)}
                    className={[
                      "flex-1 pb-3 font-sans text-[12px] uppercase tracking-[3px] transition-colors",
                      active
                        ? "text-[var(--theme-text)] border-b-2 border-hunter-gold -mb-px"
                        : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}

          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <Login setCurrentView={setCurrentView} redirectTo={redirectTo} />
          ) : currentView === LOGIN_VIEW.REGISTER ? (
            <Register setCurrentView={setCurrentView} />
          ) : (
            <ForgotPassword setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
