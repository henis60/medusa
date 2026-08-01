const createNextIntlPlugin = require("next-intl/plugin")
const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * Turn a URL env var into a remotePattern { protocol, hostname } entry so
 * next/image can optimize images served from that host.
 */
const urlToRemotePattern = (value) => {
  if (!value) return []
  try {
    const { protocol, hostname } = new URL(value)
    return [{ protocol: protocol.replace(":", ""), hostname }]
  } catch {
    return []
  }
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Emit a minimal standalone server for smaller, faster container deploys.
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    // Since locale isn't in the URL (localePrefix: "never"), both locale
    // variants of a page share the same URL — Next's client-side Router
    // Cache can't tell them apart and may reuse an RSC payload cached under
    // the other locale for up to 5min (the "static" default) on soft
    // navigation. Disabling it forces every client-side nav to refetch,
    // which still hits the server's own static/ISR cache (cheap) rather
    // than recomputing anything — this only removes client-side reuse
    // across navigations, not server-side static generation.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
    // This app's root layout lives at a top-level dynamic segment
    // (app/[locale]/layout.tsx) with no app/layout.tsx above it — exactly
    // the case Next's docs cite as the reason global-not-found.js exists:
    // there's no single root layout to compose a 404 page from. Without
    // this flag, the plain app/not-found.tsx fallback has to hand-render
    // its own <html>/<body> with zero client-side JS (see that file's
    // comment for the hydration crash that resulted from not doing this).
    globalNotFound: true,
  },
  // Verbose fetch logging helps in dev but is noisy/slower in production.
  ...(process.env.NODE_ENV === "production"
    ? {}
    : { logging: { fetches: { fullUrl: true } } }),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      // Cloudflare R2 public dev URLs (product images) — used on staging
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // Cloudflare R2 custom domain (production product images)
      {
        protocol: "https",
        hostname: "media.thehunter.ro",
      },
      // Backend public file host (product images)
      ...urlToRemotePattern(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL),
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
          {
            protocol: "https",
            hostname: S3_HOSTNAME,
            pathname: S3_PATHNAME,
          },
        ]
        : []),
    ],
  },
}

module.exports = withNextIntl(nextConfig)
