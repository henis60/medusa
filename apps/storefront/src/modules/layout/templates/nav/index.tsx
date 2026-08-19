import {
  listCollections,
  getCollectionWithProductCategories,
} from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { listRegions } from "@lib/data/regions"
import { isMetadataFlagSet } from "@lib/util/metadata-flag"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import NavShell from "@modules/layout/components/nav-shell"

export default async function Nav({
  rightAction,
  logoSuffix,
  logoHref = "/",
}: {
  rightAction?: React.ReactNode
  logoSuffix?: React.ReactNode
  logoHref?: string
} = {}) {
  // No cookie reads here — the nav is part of the static/ISR shell.
  // SideMenu resolves the current locale client-side from the cookie.
  const [regions, locales, { collections }, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    listCollections(),
    listCategories(),
  ])

  // Which collection shows as its own top-level menu entry (previously just
  // "whichever collection was created most recently") is now an explicit
  // opt-in via metadata.featured — set it on exactly one collection in the
  // admin's Metadata editor. Every other collection shows up in the menu's
  // "Colecții" list unconditionally (mirrors "Ready to Wear" showing every
  // category except the one flagged as the Accessories parent).
  const featuredCollectionRef = collections.find((c) =>
    isMetadataFlagSet(c.metadata, "featured")
  )
  const menuCollections = collections.filter(
    (c) => c.id !== featuredCollectionRef?.id
  )

  const featuredCollection = featuredCollectionRef
    ? await getCollectionWithProductCategories(featuredCollectionRef.id)
    : null

  return (
    <NavShell>
      <div className="flex-1 basis-0 h-full flex items-center">
        <div className="h-full flex items-center opacity-80 hover:opacity-60 transition-opacity">
          <SideMenu
            regions={regions}
            locales={locales}
            currentLocale={null}
            collections={menuCollections}
            categories={categories}
            featuredCollection={featuredCollection}
          />
        </div>
      </div>

      <div className="flex items-center h-full" data-nav-logo>
        <LocalizedClientLink
          href={logoHref}
          className="font-display text-xl tracking-[0.12em] hover:opacity-70 transition-opacity flex items-baseline gap-1.5"
          data-testid="nav-store-link"
        >
          <span className="uppercase">The Hunter</span>
          {logoSuffix}
        </LocalizedClientLink>
      </div>

      <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end opacity-80">
        {rightAction ?? <CartButton />}
      </div>
    </NavShell>
  )
}
