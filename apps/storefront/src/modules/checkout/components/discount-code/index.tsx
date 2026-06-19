"use client"

import React from "react"
import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "../error-message"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const { promotions = [] } = cart

  const removePromotionCode = async (code: string) => {
    const remaining = promotions
      .filter((p) => p.code !== code && p.code !== undefined)
      .map((p) => p.code!)
    await applyPromotions(remaining)
  }

  const addPromotionCode = async (formData: FormData) => {
    setErrorMessage("")
    const code = formData.get("code")
    if (!code) return
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codeStr = code.toString().trim()
    const codes = promotions.filter((p) => p.code).map((p) => p.code!)
    codes.push(codeStr)
    try {
      const updatedCart = await applyPromotions(codes)
      const applied = updatedCart?.promotions?.some(
        (p) => p.code?.toLowerCase() === codeStr.toLowerCase()
      )
      if (!applied) {
        setErrorMessage("Codul promoțional nu este valid sau a expirat.")
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }
    if (input) input.value = ""
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="add-discount-button"
        className="flex items-center gap-2 font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors w-fit"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="5" y1="1" x2="5" y2="9" />
          <line x1="1" y1="5" x2="9" y2="5" />
        </svg>
        Cod promoțional
      </button>

      {isOpen && (
        <form action={addPromotionCode} className="flex gap-2">
          <input
            id="promotion-input"
            name="code"
            type="text"
            autoFocus={false}
            data-testid="discount-input"
            placeholder="CODUL TĂU"
            className="flex-1 bg-transparent border border-[var(--theme-border)] px-3 py-2 font-sans text-base text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-hunter-gold/50 transition-colors"
          />
          <button
            type="submit"
            data-testid="discount-apply-button"
            className="font-sans text-[9px] uppercase tracking-[3px] px-4 py-2 border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-hunter-gold/50 hover:text-hunter-gold transition-colors whitespace-nowrap"
          >
            Aplică
          </button>
        </form>
      )}

      <ErrorMessage error={errorMessage} data-testid="discount-error-message" />

      {promotions.length > 0 && (
        <div className="flex flex-col gap-2">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="flex items-center justify-between"
              data-testid="discount-row"
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-sans text-[9px] uppercase tracking-[2px] text-hunter-gold border border-hunter-gold/30 px-2 py-0.5"
                  data-testid="discount-code"
                >
                  {promotion.code}
                </span>
                {promotion.application_method?.value !== undefined && (
                  <span className="font-sans text-[9px] text-[var(--theme-text-muted)]">
                    {promotion.application_method.type === "percentage"
                      ? `−${promotion.application_method.value}%`
                      : promotion.application_method.currency_code
                      ? `−${convertToLocale({
                          amount: +promotion.application_method.value,
                          currency_code: promotion.application_method.currency_code,
                        })}`
                      : null}
                  </span>
                )}
              </div>
              {!promotion.is_automatic && (
                <button
                  onClick={() => promotion.code && removePromotionCode(promotion.code)}
                  data-testid="remove-discount-button"
                  aria-label="Șterge codul"
                  className="text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="9" y2="9" />
                    <line x1="9" y1="1" x2="1" y2="9" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DiscountCode
