const NGROK = process.env.NEXT_PUBLIC_NGROK_URL
const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  // In dev with ngrok, rewrite any localhost backend URL to the ngrok tunnel
  if (process.env.NODE_ENV === "development" && NGROK) {
    return url.replace(/^http:\/\/localhost:\d+/, NGROK)
  }
  return url
}
