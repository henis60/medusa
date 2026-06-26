import { clx } from "@modules/common/components/ui"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

const SaveButton = () => {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      data-testid="save-button"
      className="h-10 px-6 font-sans text-[10px] uppercase tracking-[3px] bg-hunter-gold text-hunter-dark hover:bg-hunter-gold/90 transition-colors disabled:opacity-50"
    >
      {pending ? "Se salvează…" : "Salvează"}
    </button>
  )
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "A apărut o eroare, încearcă din nou",
  children,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="py-6" data-testid={dataTestid}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
            {label}
          </span>
          {!state && (
            <div
              className="font-serif text-[15px] text-[var(--theme-text)]"
              data-testid="current-info"
            >
              {currentInfo}
            </div>
          )}
        </div>
        <button
          onClick={handleToggle}
          type={state ? "reset" : "button"}
          data-testid="edit-button"
          data-active={state}
          className="shrink-0 font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
        >
          {state ? "Anulează" : "Editează"}
        </button>
      </div>

      {/* Success */}
      <div
        className={clx(
          "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
          isSuccess ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
        )}
        data-testid="success-message"
      >
        <p className="font-sans text-[10px] text-emerald-500 mt-3">
          {label} updated successfully
        </p>
      </div>

      {/* Error */}
      <div
        className={clx(
          "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
          isError ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
        )}
        data-testid="error-message"
      >
        <p className="font-sans text-[10px] text-rose-500 mt-3">
          {errorMessage}
        </p>
      </div>

      {/* Edit form */}
      <div
        className={clx(
          "transition-[max-height,opacity] duration-300 ease-in-out",
          state
            ? "max-h-[1000px] opacity-100 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="flex flex-col gap-y-3 pt-4">
          <div>{children}</div>
          <div className="flex justify-end mt-1">
            <SaveButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountInfo
