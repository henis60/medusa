type Props = {
  full?: boolean
}

const SkeletonAccountPage = ({ full = false }: Props) => {
  const content = (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-6 w-48 bg-[var(--theme-surface-raised)]" />
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 w-full bg-[var(--theme-surface-raised)] border border-[var(--theme-border)]"
          />
        ))}
      </div>
    </div>
  )

  if (!full) {
    return <div className="p-6 small:p-8">{content}</div>
  }

  return (
    <div className="flex-1 py-6 sm:py-10 animate-pulse" data-testid="account-page">
      <div className="page-container">
        <div className="mb-6 sm:mb-10">
          <div className="h-2.5 w-24 bg-[var(--theme-surface-raised)] mb-3" />
          <div className="h-10 small:h-12 w-64 bg-[var(--theme-surface-raised)]" />
        </div>
        <div className="grid grid-cols-1 small:grid-cols-[220px_1fr] gap-0 border-t border-[var(--theme-border)]">
          <div className="border-b small:border-b-0 small:border-r border-[var(--theme-border)] p-6 flex flex-col gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-3 w-28 bg-[var(--theme-surface-raised)]"
              />
            ))}
          </div>
          <div className="p-6 small:p-8">{content}</div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonAccountPage
