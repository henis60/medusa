import { getCartId } from "@lib/data/cookies"
import PlatiOnlineReturn from "./return-client"

/**
 * PlatiOnline relay return page. PlatiOnline returns the customer via a
 * cross-site POST, so the cart cookie may be absent; we therefore read the
 * payment `session_id` from the URL and fall back to the cookie cart id.
 */
export default async function PlatiOnlineReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const cartId = await getCartId()

  return <PlatiOnlineReturn sessionId={session_id} cartId={cartId} />
}
