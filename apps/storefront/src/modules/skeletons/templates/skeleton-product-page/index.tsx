import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

const SkeletonProductPage = () => {
  return (
    <div className="bg-[var(--theme-bg)] min-h-screen animate-pulse">
      {/* Back link */}
      <div className="page-container pt-3 small:pt-6 pb-0">
        <div className="h-3 w-28 bg-[var(--theme-surface-raised)]" />
      </div>

      {/* Main product section */}
      <div className="page-container grid grid-cols-1 small:grid-cols-[1fr_400px] gap-x-16 py-8 small:pb-12 pt-2 small:pt-8 small:max-w-5xl">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] w-full bg-[var(--theme-surface-raised)]" />
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square w-16 bg-[var(--theme-surface-raised)]"
              />
            ))}
          </div>
        </div>

        {/* Info + actions */}
        <div className="flex flex-col gap-y-6 py-4 small:py-0">
          <div className="h-3 w-24 bg-[var(--theme-surface-raised)]" />
          <div className="h-8 w-3/4 bg-[var(--theme-surface-raised)]" />
          <div className="h-5 w-28 bg-[var(--theme-surface-raised)]" />
          <div className="flex flex-col gap-3 mt-2">
            <div className="h-3 w-full bg-[var(--theme-surface-raised)]" />
            <div className="h-3 w-5/6 bg-[var(--theme-surface-raised)]" />
            <div className="h-3 w-2/3 bg-[var(--theme-surface-raised)]" />
          </div>
          <div className="h-12 w-full bg-[var(--theme-surface-raised)] mt-4" />
          <div className="h-12 w-full bg-[var(--theme-surface-raised)]" />
        </div>
      </div>

      {/* Related products */}
      <div className="page-container my-10">
        <SkeletonRelatedProducts />
      </div>
    </div>
  )
}

export default SkeletonProductPage
