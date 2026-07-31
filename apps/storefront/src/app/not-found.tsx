import NotFoundContent from "@modules/common/components/not-found"
import { routing } from "@i18n/routing"

export default async function NotFound() {
  return <NotFoundContent locale={routing.defaultLocale} />
}
