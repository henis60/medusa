"use client"

import { useEffect, useState } from "react"
import { clx } from "@modules/common/components/ui"

const thumbClass =
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-hunter-gold [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-hunter-gold [&::-moz-range-thumb]:border-0"

export default function PriceRangeSlider({
  bounds,
  value,
  onCommit,
}: {
  bounds: [number, number]
  value: [number, number]
  onCommit: (v: [number, number]) => void
}) {
  const [min, max] = bounds
  const [lo, setLo] = useState(value[0])
  const [hi, setHi] = useState(value[1])

  useEffect(() => {
    setLo(value[0])
    setHi(value[1])
  }, [value[0], value[1]])

  if (max <= min) return null

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  return (
    <div className="pt-1">
      <div className="relative h-5 flex items-center">
        <div className="absolute left-0 right-0 h-[3px] bg-[var(--theme-border)] rounded-full" />
        <div
          className="absolute h-[3px] bg-hunter-gold rounded-full"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
          onMouseUp={() => onCommit([lo, hi])}
          onTouchEnd={() => onCommit([lo, hi])}
          className={clx(
            "absolute w-full h-5 appearance-none bg-transparent pointer-events-none",
            thumbClass
          )}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
          onMouseUp={() => onCommit([lo, hi])}
          onTouchEnd={() => onCommit([lo, hi])}
          className={clx(
            "absolute w-full h-5 appearance-none bg-transparent pointer-events-none",
            thumbClass
          )}
        />
      </div>
      <div className="flex justify-between mt-1.5 font-sans text-[11px] text-[var(--theme-text-muted)]">
        <span>{lo} LEI</span>
        <span>{hi} LEI</span>
      </div>
    </div>
  )
}
