import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { isColorOption as isColorOptionTitle } from "@lib/util/product"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  disabledValues?: Set<string>
  variants?: HttpTypes.StoreProductVariant[] | null
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
  variants,
}) => {
  const SIZE_ORDER = ["xxs","xs","s","m","l","xl","xxl","2xl","3xl","4xl"]
  const isColorOption = isColorOptionTitle(title)

  const rawValues = (option.values ?? []).map((v) => v.value)

  // Colors follow variant creation order (matches image grouping), since the
  // raw option.values order is not consistent across store/preview APIs.
  const colorOrdered = () => {
    const seen: string[] = []
    for (const v of variants ?? []) {
      const val = v.options?.find((o) => o.option_id === option.id)?.value
      if (val && !seen.includes(val)) seen.push(val)
    }
    // Append any value not covered by a variant, preserving raw order
    for (const val of rawValues) {
      if (val && !seen.includes(val)) seen.push(val)
    }
    return seen.length ? seen : rawValues
  }

  // Colors keep variant order; only sizes are sorted logically.
  const filteredOptions = isColorOption
    ? colorOrdered()
    : [...rawValues].sort((a, b) => {
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
                "inline-flex items-center justify-center h-8 min-w-[48px] px-3 border font-sans text-[11px] leading-none uppercase tracking-[2px] transition-colors duration-150",
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
