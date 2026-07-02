// Lightweight liveness probe for Railway's healthcheck. Always executes (never
// statically cached) and returns 200, so a new deploy only starts receiving
// traffic once the server is actually up.
export const dynamic = "force-dynamic"

export function GET() {
  return new Response("OK", {
    status: 200,
    headers: { "content-type": "text/plain" },
  })
}
