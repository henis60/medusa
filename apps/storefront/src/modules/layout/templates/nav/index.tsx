import { Suspense } from "react"

import {
  listCollections,
  getCollectionWithProductCategories,
} from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import NavShell from "@modules/layout/components/nav-shell"
import {
  BagIcon,
  ShopIcon,
} from "@modules/layout/components/nav-icons"

export default async function Nav() {
  const [regions, locales, currentLocale, { collections }, categories] =
    await Promise.all([
      listRegions().then((regions: StoreRegion[]) => regions),
      listLocales(),
      getLocale(),
      listCollections(),
      listCategories(),
    ])

  const sortedCollections = [...collections].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime()
  )

  const featuredCollection = sortedCollections[0]
    ? await getCollectionWithProductCategories(sortedCollections[0].id)
    : null

  return (
    <NavShell>
      <div className="flex-1 basis-0 h-full flex items-center">
        <div className="h-full flex items-center opacity-80 hover:opacity-60 transition-opacity">
          <SideMenu
            regions={regions}
            locales={locales}
            currentLocale={currentLocale}
            collections={sortedCollections}
            categories={categories}
            featuredCollection={featuredCollection}
          />
        </div>
      </div>

      <div className="flex items-center h-full" data-nav-logo>
        <LocalizedClientLink
          href="/"
          className="font-display text-xl tracking-[0.12em] hover:opacity-70 transition-opacity flex items-baseline gap-1.5"
          data-testid="nav-store-link"
        >
          <span className="uppercase">The Hunter</span>
        </LocalizedClientLink>
      </div>

      <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end opacity-80">
        <Suspense
          fallback={
            <LocalizedClientLink
              className="flex items-center hover:opacity-60 transition-opacity"
              href="/cart"
              data-testid="nav-cart-link"
              aria-label="Cart"
            >
              <BagIcon size={22} />
            </LocalizedClientLink>
          }
        >
          <CartButton />
        </Suspense>
      </div>
    </NavShell>
  )
}
