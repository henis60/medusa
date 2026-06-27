import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Ensure a stable cache id cookie exists. It is used to build per-visitor
  // cache tags (see getCacheTag), which Next.js relies on to revalidate the
  // cart after add/update/delete. Without it, revalidateTag is a no-op and the
  // cart appears "stuck" (stale items, deletes/adds not reflected).
  if (!request.cookies.get("_medusa_cache_id")) {
    response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
      maxAge: 60 * 60 * 24,
    })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
