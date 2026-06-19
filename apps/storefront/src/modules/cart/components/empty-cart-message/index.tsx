import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-6 text-center"
      data-testid="empty-cart-message"
    >
      <p className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
        Coșul este gol
      </p>
      <p className="font-sans text-sm text-[var(--theme-text-muted)] max-w-xs">
        Nu ai adăugat niciun produs în coș.
      </p>
      <LocalizedClientLink
        href="/store"
        className="mt-2 px-8 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
      >
        Descoperă colecția
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
