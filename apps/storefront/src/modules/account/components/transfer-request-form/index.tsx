"use client"
import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-6 w-full">
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[4px] text-[var(--theme-text-muted)] mb-2">
          Order Transfer
        </p>
        <h2 className="font-display text-[22px] leading-[1.1] text-[var(--theme-text)] mb-1">
          Connect an order
        </h2>
        <p className="font-sans text-[11px] text-[var(--theme-text-muted)]">
          Can&apos;t find an order? Link it to your account using its Order ID.
        </p>
      </div>

      <form action={formAction} className="flex flex-col small:flex-row gap-3 small:items-end">
        <div className="flex-1 max-w-sm">
          <Input
            className="w-full"
            name="order_id"
            placeholder="Order ID"
            label="Order ID"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-6 font-sans text-[10px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-hunter-gold hover:text-hunter-gold transition-colors whitespace-nowrap self-end small:self-auto"
        >
          Request Transfer
        </button>
      </form>

      {!state.success && state.error && (
        <p className="font-sans text-[10px] text-rose-500">
          {state.error}
        </p>
      )}

      {showSuccess && (
        <div className="flex items-start justify-between gap-4 p-4 border border-[var(--theme-border)] bg-[var(--theme-surface)]">
          <div className="flex gap-3 items-start">
            <CheckCircleMiniSolid className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-[11px] text-[var(--theme-text)] mb-0.5">
                Transfer requested for order {state.order?.id}
              </p>
              <p className="font-sans text-[10px] text-[var(--theme-text-muted)]">
                Confirmation email sent to {state.order?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="shrink-0 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
          >
            <XCircleSolid className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
