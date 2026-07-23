import { ChevronUpDown } from "@medusajs/icons"
import {
  SelectHTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

export type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  label?: string
} & SelectHTMLAttributes<HTMLSelectElement>

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      placeholder = "Select...",
      defaultValue,
      value,
      className,
      children,
      label,
      required,
      onChange,
      onInvalid,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [error, setError] = useState<string | null>(null)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    const handleInvalid = (e: React.FormEvent<HTMLSelectElement>) => {
      e.preventDefault()
      setError("Acest câmp este obligatoriu")
      onInvalid?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (error) setError(null)
      onChange?.(e)
    }

    return (
      <div className="flex flex-col w-full gap-1">
        {(label || placeholder) && (
          <label className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">
            {label || placeholder}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={innerRef}
            {...(value !== undefined
              ? { value }
              : { defaultValue: defaultValue ?? "" })}
            required={required}
            onChange={handleChange}
            onInvalid={handleInvalid}
            aria-invalid={error ? true : undefined}
            {...props}
            className={`appearance-none w-full h-10 px-3 pr-8 bg-transparent border text-[var(--theme-text)] font-sans text-[12px] focus:outline-none transition-colors ${
              error
                ? "border-rose-500 focus:border-rose-500"
                : "border-[var(--theme-border)] focus:border-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)]"
            } ${className ?? ""}`}
          >
            <option disabled value="">
              {placeholder}
            </option>
            {children}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--theme-text-muted)]">
            <ChevronUpDown />
          </span>
        </div>
        {error && (
          <span className="font-sans text-[10px] text-rose-500" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

NativeSelect.displayName = "NativeSelect"

export default NativeSelect
