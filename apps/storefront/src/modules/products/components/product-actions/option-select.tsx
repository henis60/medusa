import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  disabledValues?: Set<string>
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  disabledValues,
}) => {
  const SIZE_ORDER = ["xxs","xs","s","m","l","xl","xxl","2xl","3xl","4xl"]

  const filteredOptions = (option.values ?? [])
    .map((v) => v.value)
    .sort((a, b) => {
      const ai = SIZE_ORDER.indexOf((a ?? "").toLowerCase())
      const bi = SIZE_ORDER.indexOf((b ?? "").toLowerCase())
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      const an = parseFloat(a ?? "")
      const bn = parseFloat(b ?? "")
      if (!isNaN(an) && !isNaN(bn)) return an - bn
      return (a ?? "").localeCompare(b ?? "")
    })

  return (
    <div className="flex flex-col gap-y-3">
      <span className="font-sans text-[10px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
        Select {title}
      </span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions.map((v) => {
          const active = v === current
          const unavailable = disabledValues?.has(v) ?? false
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "inline-flex items-center justify-center h-10 min-w-[56px] px-4 border font-sans text-[11px] leading-none uppercase tracking-[2px] transition-colors duration-150",
                active
                  ? "border border-hunter-gold bg-hunter-gold/10 text-[var(--theme-text)]"
                  : unavailable
                  ? "border border-[var(--theme-border)] text-[var(--theme-text-muted)] opacity-30 line-through cursor-not-allowed"
                  : "border border-[var(--theme-border)] bg-transparent text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              )}
              disabled={disabled || unavailable}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
