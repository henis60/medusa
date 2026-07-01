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
      <p
        ref={ref}
        className={clx(
          "font-serif text-sm small:text-lg text-[var(--theme-text-muted)] leading-relaxed",
          !expanded && "line-clamp-2 small:line-clamp-3"
        )}
      >
        {text}
      </p>
      {!expanded && clipped && (
        <a
          role="button"
          onClick={() => setExpanded(true)}
          className="absolute bottom-0 right-0 bg-[var(--theme-bg)] font-serif text-sm small:text-lg leading-relaxed text-hunter-gold hover:opacity-70 transition-opacity cursor-pointer"
        >
          … citește mai mult
        </a>
      )}
    </div>
  )
}
