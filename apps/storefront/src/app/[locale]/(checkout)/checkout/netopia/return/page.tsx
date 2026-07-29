import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import NetopiaReturnClient from "./return-client"

export default async function NetopiaReturnPage() {
  const t = await getTranslations("checkout")
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm">{t("Se procesează plata…")}</div>}>
      <NetopiaReturnClient />
    </Suspense>
  )
}
