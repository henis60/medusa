"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { SortOptions } from "../refinement-list/sort-products"
import { clx } from "@modules/common/components/ui"
import { AnimatePresence, motion } from "framer-motion"

function PriceChevron({ dir }: { dir: "up" | "down" }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline-block"
    >
      <polyline points={dir === "up" ? "6 15 12 9 18 15" : "6 9 12 15 18 9"} />
    </svg>
  )
}

const sortOptions: {
  value: SortOptions
  label: string
  icon?: "up" | "down"
}[] = [
  { value: "created_at", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț", icon: "up" },
  { value: "price_desc", label: "Preț", icon: "down" },
]

export default function StoreSortSelect({ sortBy }: { sortBy: SortOptions }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set("sortBy", value)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
      setOpen(false)
    },
    [pathname, router, searchParams]
  )

  return (
    <div className="flex items-center gap-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-6"
          >
            {[...sortOptions].reverse().map((opt, i) => (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                onClick={() => handleChange(opt.value)}
                className={clx(
                  "inline-flex items-center gap-1 font-sans text-[10px] uppercase tracking-[2px] transition-colors whitespace-nowrap",
                  sortBy === opt.value
                    ? "text-hunter-gold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                )}
              >
                {opt.label}
                {opt.icon && <PriceChevron dir={opt.icon} />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clx(
          "font-sans text-[10px] uppercase tracking-[3px] transition-colors underline underline-offset-2",
          open
            ? "text-hunter-gold"
            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
        )}
      >
        Sortare
      </button>
    </div>
  )
}
