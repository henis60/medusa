import LocalizedClientLink from "@modules/common/components/localized-client-link"

type NotFoundContentProps = {
  title?: string
  description?: string
}

const NotFoundContent = ({
  title = "Pagină negăsită",
  description = "Se pare că te-ai rătăcit. Pagina căutată nu mai există sau și-a schimbat locul. Întoarce-te la pagina principală și încearcă din nou.",
}: NotFoundContentProps) => {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-white px-6 py-24">
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="flex items-center gap-4">
          <span className="h-px w-10 bg-hunter-gold/50" />
          <span className="font-cinzel text-[0.7rem] uppercase tracking-[0.35em] text-hunter-gold">
            The Hunter House
          </span>
          <span className="h-px w-10 bg-hunter-gold/50" />
        </div>

        {/* 404 */}
        <h1 className="mt-8 font-display text-[6rem] font-bold leading-none text-hunter-green sm:text-[9rem]">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 font-serif text-3xl font-light tracking-wide text-hunter-green sm:text-4xl">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-5 max-w-md font-sans text-base font-light leading-relaxed text-hunter-walnut/70">
          {description}
        </p>

        {/* CTA */}
        <LocalizedClientLink
          href="/"
          className="group mt-10 inline-flex items-center gap-3 border border-hunter-gold-d/60 bg-transparent px-8 py-3.5 font-cinzel text-xs uppercase tracking-[0.25em] text-hunter-gold-d transition-all duration-300 ease-out hover:border-hunter-green hover:bg-hunter-green hover:text-hunter-ivory"
        >
          Înapoi la pagina principală
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 ease-out group-hover:translate-x-1"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default NotFoundContent
