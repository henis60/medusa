import { routing } from "@i18n/routing"
import { getTranslations } from "next-intl/server"
import BackHomeButton from "./back-home-button"

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
      <BackHomeButton label={t("Înapoi la pagina principală")} />
    </div>
  )
}

export default NotFoundContent
