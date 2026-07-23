type Props = {
  full?: boolean
}

// Mirrors the account layout: welcome hero → (mobile) menu box / (desktop)
// sidebar + content column with the member-card block.
const SkeletonAccountPage = ({ full = false }: Props) => {
  const content = (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* member-card-sized block */}
      <div className="h-28 w-full bg-[var(--theme-surface-raised)]" />
      <div className="h-2.5 w-32 bg-[var(--theme-surface-raised)]" />
      <div className="flex flex-col divide-y divide-[var(--theme-border)] border border-[var(--theme-border)]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[72px] p-4 flex flex-col justify-center gap-2">
            <div className="h-4 w-20 bg-[var(--theme-surface-raised)]" />
            <div className="h-2.5 w-28 bg-[var(--theme-surface-raised)]" />
          </div>
        ))}
      </div>
    </div>
  )

  if (!full) {
    // Sub-page content slot: flush on mobile, padded on desktop (matches pages)
    return <div className="pt-6 small:px-8 small:py-8">{content}</div>
  }

  return (
    <div
      className="flex-1 py-6 sm:py-10 animate-pulse"
      data-testid="account-page"
    >
      <div className="page-container">
        {/* Welcome hero */}
        <div className="small:border-b border-[var(--theme-border)] pb-0 sm:pb-10">
          <div className="h-2.5 w-16 bg-[var(--theme-surface-raised)] mb-3" />
          <div className="h-8 small:h-10 w-56 bg-[var(--theme-surface-raised)] mb-2" />
          <div className="h-8 small:h-10 w-36 bg-[var(--theme-surface-raised)]" />
        </div>

        {/* Mobile: menu box above the content */}
        <div className="small:hidden pt-5">
          <div className="flex flex-col divide-y divide-[var(--theme-border)] border border-[var(--theme-border)]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="min-h-[56px] p-4 flex items-center">
                <div className="h-4 w-32 bg-[var(--theme-surface-raised)]" />
              </div>
            ))}
          </div>
          <div className="pt-5">{content}</div>
        </div>

        {/* Desktop: sidebar + content */}
        <div className="hidden small:grid small:grid-cols-[220px_1fr] small:gap-10">
          <div className="py-8 pr-8 border-r border-[var(--theme-border)] flex flex-col gap-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 w-28 bg-[var(--theme-surface-raised)]"
              />
            ))}
          </div>
          <div className="px-8 py-8">{content}</div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonAccountPage
