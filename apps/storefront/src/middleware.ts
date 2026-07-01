import { NextRequest, NextResponse } from "next/server"

const CACHE_ID_COOKIE = "_medusa_cache_id"

/**
 * Generate a UUID for the cache id cookie.
 *
 * Prefer the Web Crypto API, but fall back to a manual v4 generator when
 * `crypto`/`crypto.randomUUID` is unavailable in the runtime. This avoids a
 * `ReferenceError`/`TypeError` from taking down the edge function (and with it
 * the whole site, since every route is matched by this middleware).
 */
function generateCacheId(): string {
  const webCrypto = globalThis.crypto
  if (webCrypto && typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID()
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === "x" ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Ensure a stable cache id cookie exists. It is used to build per-visitor
  // cache tags (see getCacheTag), which Next.js relies on to revalidate the
  // cart after add/update/delete. Without it, revalidateTag is a no-op and the
  // cart appears "stuck" (stale items, deletes/adds not reflected).
  //
  // Wrapped in try/catch because this middleware runs for every request as a
  // Netlify edge function: an unhandled throw here surfaces as
  // "edge function invocation failed" for the entire site.
  try {
    if (!request.cookies.get(CACHE_ID_COOKIE)) {
      response.cookies.set(CACHE_ID_COOKIE, generateCacheId(), {
        maxAge: 60 * 60 * 24,
      })
    }
  } catch {
    // Intentionally ignore: a missing cache id only degrades cache
    // revalidation, it must never break request handling.
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
