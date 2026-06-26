"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { SortOptions } from "../refinement-list/sort-products"
import { clx } from "@modules/common/components/ui"
import { AnimatePresence, motion } from "framer-motion"

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
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
                  "font-sans text-[10px] uppercase tracking-[2px] transition-colors whitespace-nowrap",
                  sortBy === opt.value
                    ? "text-hunter-gold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                )}
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clx(
          "font-sans text-[10px] uppercase tracking-[3px] transition-colors",
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
