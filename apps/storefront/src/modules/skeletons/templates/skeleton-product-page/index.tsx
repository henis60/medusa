import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

const SkeletonProductPage = () => {
  return (
    <div className="bg-[var(--theme-bg)] min-h-screen animate-pulse">
      {/* Back link */}
      <div className="page-container pt-3 small:pt-4 pb-0">
        <div className="h-3 w-16 bg-[var(--theme-surface)]" />
      </div>

      {/* Main product section */}
      <div className="page-container grid grid-cols-1 small:grid-cols-[1fr_420px] gap-x-20 py-8 small:pb-16 pt-2 small:pt-4">
        {/* Gallery — thumb strip beside the main image on desktop only,
            matching VariantAwareGallery's actual layout */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-start">
            <div className="hidden small:flex flex-col gap-2 w-16 shrink-0">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] w-16 bg-[var(--theme-surface)]"
                />
              ))}
            </div>
            <div className="aspect-[3/4] flex-1 bg-white">
              <div className="w-full h-full bg-[var(--theme-surface)]" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-[var(--theme-surface)]" />
            ))}
          </div>
        </div>

        {/* Info + actions */}
        <div className="flex flex-col gap-y-6 py-4 small:py-0">
          <div className="flex flex-col gap-2">
            <div className="h-2.5 w-24 bg-[var(--theme-surface)]" />
            <div className="h-8 w-3/4 bg-[var(--theme-surface)]" />
            <div className="h-5 w-28 bg-[var(--theme-surface)] mt-1" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-3 w-full bg-[var(--theme-surface)]" />
            <div className="h-3 w-5/6 bg-[var(--theme-surface)]" />
            <div className="h-3 w-2/3 bg-[var(--theme-surface)]" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-2.5 w-16 bg-[var(--theme-surface)]" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-10 bg-[var(--theme-surface)]" />
              ))}
            </div>
          </div>
          <div className="h-12 w-full bg-[var(--theme-surface)] mt-2" />
        </div>
      </div>

      {/* Related products */}
      <SkeletonRelatedProducts />
    </div>
  )
}

export default SkeletonProductPage
