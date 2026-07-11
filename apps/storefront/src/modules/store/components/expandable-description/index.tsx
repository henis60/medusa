"use client"

import { useEffect, useRef, useState } from "react"
import { clx } from "@modules/common/components/ui"

export default function ExpandableDescription({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [clipped, setClipped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    setExpanded(false)
    setClipped(false)
  }, [text])

  useEffect(() => {
    if (expanded) return
    const id = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      setClipped(el.scrollHeight > el.clientHeight + 1)
    })
    return () => cancelAnimationFrame(id)
  }, [text, expanded])

  return (
    <div className={clx("relative", className)}>
      {/* Always reserves 3 lines — blank space if the text is shorter. */}
      <p
        ref={ref}
        className={clx(
          "font-serif text-[13px] small:text-sm text-[var(--theme-text-muted)] leading-snug min-h-[4.125em]",
          !expanded && "line-clamp-3"
        )}
      >
        {text}
      </p>
      {!expanded && clipped && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1 font-sans text-[10px] uppercase tracking-[2px] text-hunter-gold hover:opacity-80 transition-opacity"
        >
          Citește mai mult
        </button>
      )}
    </div>
  )
}
