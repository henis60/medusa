import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

type Props = {
  withSidebar?: boolean
}

const SkeletonStorePage = ({ withSidebar = false }: Props) => {
  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen animate-pulse">
      {/* Header */}
      <div className="border-b border-[var(--theme-border)]">
        <div className="page-container py-5 small:py-7">
          <div className="h-7 small:h-9 w-40 bg-[var(--theme-surface)]" />
          <div className="mt-1.5 h-3 w-3/4 max-w-md bg-[var(--theme-surface)]" />
        </div>

        {/* Mobile category pills row */}
        <div className="page-container pb-4 pt-2 small:hidden">
          <div className="flex items-center gap-5">
            {[16, 20, 14, 18].map((w, i) => (
              <div key={i} className="h-3 bg-[var(--theme-surface)]" style={{ width: w * 4 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Sort bar — desktop only */}
      <div className="hidden small:block border-b border-[var(--theme-border)]">
        <div className="page-container py-3 flex items-center justify-between">
          <div className="h-3 w-16 bg-[var(--theme-surface)]" />
          <div className="h-3 w-20 bg-[var(--theme-surface)]" />
        </div>
      </div>

      {/* Body */}
      <div className="page-container py-0 small:py-12">
        <div className="flex gap-10 small:gap-14">
          {withSidebar && (
            <div className="hidden small:flex w-52 shrink-0 flex-col gap-8">
              {[0, 1].map((g) => (
                <div key={g} className="flex flex-col gap-1">
                  <div className="h-2.5 w-20 bg-[var(--theme-surface)] mb-3" />
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-5 w-32 bg-[var(--theme-surface)] my-1"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 min-w-0 py-8 small:py-0">
            <SkeletonProductGrid />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonStorePage
