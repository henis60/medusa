import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./src/i18n/routing"

const intlMiddleware = createMiddleware(routing)

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

// Next's `matcher` config below claims to exclude "_next", "api", and any
// dotted-filename path via `.*\..*`, but its matcher compiler doesn't
// reliably honor any of that — confirmed by direct testing: identical
// regexes correctly reject these paths in plain Node, yet the running
// middleware still rewrote requests for them with a /ro prefix. This broke
// the static /ro-localities/*.json datasets (404, breaking the address
// form), every /_next/static/chunks/*.js request (silently 404ing all
// client JS site-wide, so React never hydrates), and — the same mechanism,
// just a different set of paths — every other static asset under
// public/ (favicon.svg, apple-touch-icon.png, /landing/images/*.jpg|webp,
// etc.), since none of those were previously covered by an explicit
// bypass. Checking these paths explicitly inside the middleware function
// itself sidesteps whatever Next's matcher compiler is doing; the
// `config.matcher` is kept only because Next requires *some* matcher to be
// present, not because it's trusted to actually exclude anything.
const BYPASS_PREFIXES = ["/ro-localities/", "/_next/", "/api/"]
// Any request for a file with an extension (favicon.svg, hero-suit.jpg,
// robots.txt, ...) is a static asset, never a page route in this app — so
// bypass next-intl for all of them instead of hand-listing every prefix.
const HAS_FILE_EXTENSION = /\.[a-zA-Z0-9]+$/

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    BYPASS_PREFIXES.some((p) => pathname.startsWith(p)) ||
    HAS_FILE_EXTENSION.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Strip Accept-Language so next-intl's middleware can't fall back to
  // browser-language negotiation for first-time visitors (we always want
  // routing.defaultLocale = "ro" in that case) — while still leaving
  // localeDetection enabled in routing.ts so the `_medusa_locale` cookie
  // (set when a visitor manually switches language) is still honored. See
  // the comment in src/i18n/routing.ts for why both live behind one flag.
  const headers = new Headers(request.headers)
  headers.delete("accept-language")
  const localeRequest = new NextRequest(request, { headers })

  const response = intlMiddleware(localeRequest)

  // Ensure a stable cache id cookie exists. It is used to build per-visitor
  // cache tags (see getCacheTag), which Next.js relies on to revalidate the
  // cart after add/update/delete. Without it, revalidateTag is a no-op and
  // the cart appears "stuck" (stale items, deletes/adds not reflected).
  //
  // This used to live in its own src/middleware.ts, written back when this
  // was the only middleware file — but Next.js only runs ONE middleware.ts
  // per project, and once next-intl's middleware was added at the project
  // root for the i18n rollout, this root file silently became the only one
  // that runs, leaving src/middleware.ts dead code and the cache id cookie
  // never set for any visitor since. Merged here, wrapped in try/catch
  // because an unhandled throw here would surface as "edge function
  // invocation failed" for the entire site.
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
  matcher: ["/((?!api|_next|_debug-locality|.*\\..*).*)"],
}
