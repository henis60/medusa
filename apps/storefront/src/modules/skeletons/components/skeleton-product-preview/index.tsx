const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <div className="relative w-full overflow-hidden bg-white" style={{ paddingBottom: "133.333%" }}>
        <div className="absolute inset-0 bg-[var(--theme-surface)]" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-2.5 w-4/5 bg-[var(--theme-surface)]" />
        <div className="h-2.5 w-2/5 bg-[var(--theme-surface)]" />
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-4 bg-[var(--theme-surface)]" />
            <div className="h-3 w-4 bg-[var(--theme-surface)]" />
            <div className="h-3 w-4 bg-[var(--theme-surface)]" />
          </div>
          <div className="h-2.5 w-10 bg-[var(--theme-surface)]" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
