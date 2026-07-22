import Spinner from "@modules/common/icons/spinner"

// Generic full-page fallback for route segments whose layout is too bespoke
// (landing page, checkout) to warrant a dedicated content skeleton.
export default function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ minHeight: "60vh" }}
    >
      <Spinner size="32" color="var(--theme-text-muted)" />
    </div>
  )
}
