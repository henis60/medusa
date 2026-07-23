import LocalizedClientLink from "@modules/common/components/localized-client-link"

type NotFoundContentProps = {
  title?: string
  description?: string
}

const NotFoundContent = ({
  title = "Pagină negăsită",
  description = "Se pare că te-ai rătăcit. Pagina căutată nu mai există sau și-a schimbat locul.",
}: NotFoundContentProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6 gap-4"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <h1
        className="font-display text-[32px] leading-[1]"
        style={{ color: "var(--theme-text)" }}
      >
        {title}
      </h1>
      <p
        className="font-sans text-sm max-w-sm"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {description}
      </p>
      <LocalizedClientLink
        href="/"
        className="mt-2 px-6 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
      >
        Înapoi la pagina principală
      </LocalizedClientLink>
    </div>
  )
}

export default NotFoundContent
