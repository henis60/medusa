import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[var(--theme-bg)] relative small:min-h-screen">
      <div className="h-16 bg-[var(--theme-bg)] backdrop-blur-md border-b border-[var(--theme-border)]">
        <nav className="flex h-full items-center content-container justify-between">
          <div className="flex-1 basis-0" />
          <LocalizedClientLink
            href="/"
            className="font-display text-xl tracking-[0.12em] flex items-baseline gap-1.5 hover:opacity-80 transition-opacity"
            data-testid="store-link"
          >
            <span className="text-[var(--theme-text)] uppercase">The Hunter</span>
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
