"use client"

import { useState } from "react"

export default function ShopCollectionFav() {
  const [on, setOn] = useState(false)

  return (
    <button
      type="button"
      aria-label="Adaugă la favorite"
      aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOn((v) => !v) }}
      style={{ flexShrink: 0, marginTop: "2px" }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        width="14"
        height="14"
        fill={on ? "#c9a84c" : "none"}
        stroke={on ? "#c9a84c" : "rgba(232,213,163,0.45)"}
        strokeWidth={1.6}
      >
        <path d="M12 20.5C7 17 3 13.6 3 9.6 3 7 5 5.2 7.4 5.2c1.6 0 3 .8 3.9 2.1.9-1.3 2.3-2.1 3.9-2.1C19 5.2 21 7 21 9.6c0 4-4 7.4-9 10.9z" />
      </svg>
    </button>
  )
}
