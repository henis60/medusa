import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="border-t border-[var(--theme-border)] content-container py-16 animate-pulse">
      <div className="mb-10">
        <div className="h-2.5 w-32 bg-[var(--theme-surface)] mb-4" />
        <div className="h-8 w-48 bg-[var(--theme-surface)]" />
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-5 gap-y-10">
        {repeat(4).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
