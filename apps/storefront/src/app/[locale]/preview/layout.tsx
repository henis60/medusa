import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import { setRequestLocaleValue } from "@lib/util/request-locale"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // See (main)/layout.tsx — re-seed from this segment's own params.
  const { locale } = await params
  setRequestLocaleValue(locale)

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
