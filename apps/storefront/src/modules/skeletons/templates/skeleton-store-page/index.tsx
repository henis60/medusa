import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

type Props = {
  withSidebar?: boolean
}

const SkeletonStorePage = ({ withSidebar = false }: Props) => {
  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen animate-pulse">
      {/* Header */}
      <div className="border-b border-[var(--theme-border)]">
        <div className="page-container pt-6 pb-5">
          <div className="h-2.5 w-24 bg-[var(--theme-surface-raised)] mb-5" />
          <div className="h-10 small:h-14 w-2/3 max-w-md bg-[var(--theme-surface-raised)]" />
          <div className="mt-5 h-3 w-1/2 max-w-sm bg-[var(--theme-surface-raised)]" />
        </div>
      </div>

      {/* Sort bar */}
      <div className="border-b border-[var(--theme-border)]">
        <div className="page-container py-3 flex justify-end">
          <div className="h-3 w-40 bg-[var(--theme-surface-raised)]" />
        </div>
      </div>

      {/* Body */}
      <div className="page-container py-10">
        <div className="flex gap-10 small:gap-14">
          {withSidebar && (
            <div className="hidden small:flex w-56 shrink-0 flex-col gap-10">
              {[0, 1, 2].map((g) => (
                <div key={g} className="flex flex-col gap-3">
                  <div className="h-2.5 w-20 bg-[var(--theme-surface-raised)] mb-1" />
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-3 w-32 bg-[var(--theme-surface-raised)]"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <SkeletonProductGrid />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonStorePage
