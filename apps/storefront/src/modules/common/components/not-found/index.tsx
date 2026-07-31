import { Link } from "@i18n/navigation"
import { routing } from "@i18n/routing"
import { getTranslations } from "next-intl/server"

type NotFoundContentProps = {
  title?: string
  description?: string
  locale?: string
}

const NotFoundContent = async ({
  title,
  description,
  locale,
}: NotFoundContentProps) => {
  const resolvedLocale = locale ?? routing.defaultLocale
  const t = await getTranslations({
    locale: resolvedLocale,
    namespace: "common",
  })
  const resolvedTitle = title ?? t("Pagină negăsită")
  const resolvedDescription =
    description ??
    t(
      "Se pare că te-ai rătăcit Pagina căutată nu mai există sau și-a schimbat locul",
    )
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6 gap-4"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <h1
        className="font-display text-[32px] leading-[1]"
        style={{ color: "var(--theme-text)" }}
      >
        {resolvedTitle}
      </h1>
      <p
        className="font-sans text-sm max-w-sm"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {resolvedDescription}
      </p>
      <Link
        href="/"
        className="mt-2 px-6 py-3 font-sans text-[10px] uppercase tracking-[4px] border border-hunter-gold text-hunter-gold hover:bg-hunter-gold hover:text-hunter-dark transition-colors"
      >
        {t("Înapoi la pagina principală")}
      </Link>
    </div>
  )
}

export default NotFoundContent
