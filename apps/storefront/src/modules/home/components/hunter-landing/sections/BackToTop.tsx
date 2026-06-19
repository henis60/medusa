"use client"

export default function BackToTop() {
  return (
    <button
      className="btt"
      id="btt"
      type="button"
      aria-label="Înapoi sus"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 14l5-5 5 5z" fill="currentColor" />
      </svg>
    </button>
  )
}
