"use client"

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import { ChevronUpDown } from "@medusajs/icons"
import { useEffect, useState } from "react"

type County = { id: number; name: string; code: string }
type Locality = { id: number; name: string }

// Module-level caches so the datasets are fetched at most once per session.
let countiesCache: County[] | null = null
const localitiesCache: Record<string, Locality[]> = {}

async function fetchCounties(): Promise<County[]> {
  if (countiesCache) return countiesCache
  const res = await fetch("/api/ro-localities")
  const { counties } = await res.json()
  const list = Array.isArray(counties) ? counties : []
  countiesCache = list
  return list
}

async function fetchLocalities(countyId: number): Promise<Locality[]> {
  const key = String(countyId)
  if (localitiesCache[key]) return localitiesCache[key]
  const res = await fetch(`/api/ro-localities?county_id=${countyId}`)
  const { localities } = await res.json()
  const list = Array.isArray(localities) ? localities : []
  localitiesCache[key] = list
  return list
}

const fieldLabelCls =
  "font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]"
const controlCls =
  "appearance-none w-full h-10 px-3 pr-8 bg-transparent border border-[var(--theme-border)] text-[var(--theme-text)] font-sans text-[12px] focus:outline-none focus:border-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
const optionsCls =
  "z-50 max-h-60 overflow-auto border border-[var(--theme-border)] bg-[var(--theme-bg,#0D0D0D)] shadow-lg focus:outline-none [--anchor-gap:4px]"
const optionCls =
  "cursor-pointer px-3 py-2 font-sans text-[12px] text-[var(--theme-text)] data-[focus]:bg-hunter-gold/10 data-[focus]:text-hunter-gold"

function ComboField<T extends { id: number; name: string }>({
  label,
  required,
  value,
  options,
  onSelect,
  disabled,
  placeholder,
  testId,
}: {
  label: string
  required?: boolean
  value: T | null
  options: T[]
  onSelect: (v: T | null) => void
  disabled?: boolean
  placeholder?: string
  testId?: string
}) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  const MAX_RESULTS = 50
  const list = options ?? []
  const matches = query
    ? list.filter((o) =>
        o.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : list
  // Render at most MAX_RESULTS — large counties have 600+ localities and
  // rendering them all makes the dropdown sluggish.
  const filtered = matches?.slice(0, MAX_RESULTS)
  const truncated = matches?.length > MAX_RESULTS

  const handleSelect = (v: T | null) => {
    if (error) setError(null)
    onSelect(v)
  }

  return (
    <div className="flex flex-col w-full gap-1">
      <label className={fieldLabelCls}>
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <Combobox
        value={value}
        onChange={handleSelect}
        disabled={disabled}
        immediate
        onClose={() => setQuery("")}
      >
        <div className="relative w-full">
          <ComboboxInput
            className={`${controlCls} ${
              error ? "border-rose-500 focus:border-rose-500" : ""
            }`}
            displayValue={(o: T | null) => o?.name ?? ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            data-testid={testId}
            autoComplete="off"
            required={required}
            aria-invalid={error ? true : undefined}
            onInvalid={(e) => {
              e.preventDefault()
              setError("Acest câmp este obligatoriu")
            }}
          />
          <ComboboxButton className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]">
            <ChevronUpDown />
          </ComboboxButton>
          <ComboboxOptions
            anchor="bottom start"
            className={optionsCls}
            style={{ width: "var(--input-width)" }}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 font-sans text-[12px] text-[var(--theme-text-muted)]">
                Niciun rezultat
              </div>
            ) : (
              <div>
                {filtered.map((o) => (
                  <ComboboxOption key={o.id} value={o} className={optionCls}>
                    {o.name}
                  </ComboboxOption>
                ))}
                {truncated && (
                  <div className="px-3 py-2 font-sans text-[11px] text-[var(--theme-text-muted)]">
                    Scrie pentru a căuta…
                  </div>
                )}
              </div>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error && (
        <span className="font-sans text-[10px] text-rose-500" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export type LocalitySelectProps = {
  countyFieldName: string
  cityFieldName: string
  countyValue?: string
  cityValue?: string
  onChange?: (name: string, value: string) => void
  required?: boolean
}

/**
 * Dependent Județ → Localitate pickers backed by the official RO localities
 * dataset, so the submitted province/city are always values the courier
 * (Europarcel) recognises. Renders hidden inputs under the given field names
 * for native FormData submission, and also calls onChange for controlled forms.
 */
const LocalitySelect = ({
  countyFieldName,
  cityFieldName,
  countyValue,
  cityValue,
  onChange,
  required,
}: LocalitySelectProps) => {
  const [counties, setCounties] = useState<County[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [county, setCounty] = useState<County | null>(null)
  const [city, setCity] = useState<Locality | null>(null)

  useEffect(() => {
    fetchCounties().then(setCounties)
  }, [])

  // Preselect county from an incoming value (e.g. saved/edited address).
  useEffect(() => {
    if (!counties.length || !countyValue) return
    const match = counties.find(
      (c) => c.name.toLowerCase() === countyValue.toLowerCase()
    )
    if (match && match.id !== county?.id) setCounty(match)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counties, countyValue])

  // Load localities whenever the selected county changes.
  useEffect(() => {
    if (!county) {
      setLocalities([])
      return
    }
    fetchLocalities(county.id).then(setLocalities)
  }, [county])

  // Preselect locality from an incoming value once its county's list is loaded.
  useEffect(() => {
    if (!localities.length || !cityValue) return
    const match = localities.find(
      (l) => l.name.toLowerCase() === cityValue.toLowerCase()
    )
    if (match && match.id !== city?.id) setCity(match)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localities, cityValue])

  const handleCounty = (c: County | null) => {
    setCounty(c)
    setCity(null)
    onChange?.(countyFieldName, c?.name ?? "")
    onChange?.(cityFieldName, "")
  }

  const handleCity = (l: Locality | null) => {
    setCity(l)
    onChange?.(cityFieldName, l?.name ?? "")
  }

  return (
    <>
      <input type="hidden" name={countyFieldName} value={county?.name ?? ""} />
      <input type="hidden" name={cityFieldName} value={city?.name ?? ""} />
      <ComboField
        label="Județ"
        required={required}
        value={county}
        options={counties}
        onSelect={handleCounty}
        placeholder="Caută județ"
        testId="province-select"
      />
      <ComboField
        key={county?.id ?? "no-county"}
        label="Localitate"
        required={required}
        value={city}
        options={localities}
        onSelect={handleCity}
        disabled={!county}
        placeholder={county ? "Caută localitate" : "Alege întâi județul"}
        testId="city-select"
      />
    </>
  )
}

export default LocalitySelect
