"use client"

import { useEffect } from "react"
import { useRouter } from "@i18n/navigation"
import { onCartUpdated } from "@lib/util/cart-events"

/**
 * The /cart page is a Server Component that only ever re-fetches when Next
 * refreshes the route after the Server Action that triggered a mutation
 * (add/remove/update) resolves. That implicit refresh can be missed — e.g.
 * in dev, React Strict Mode double-dispatches some actions, and only one of
 * the two in-flight requests "wins" the refresh — leaving the page showing
 * a stale item list even though the mutation succeeded server-side. This
 * listens for the same cart:updated event the nav badge/drawer already use
 * and forces a router.refresh() as a belt-and-braces resync, independent of
 * whichever action instance the router paired its refresh with.
 */
export default function CartRefreshOnUpdate() {
  const router = useRouter()

  useEffect(() => {
    return onCartUpdated(() => {
      router.refresh()
    })
  }, [router])

  return null
}
