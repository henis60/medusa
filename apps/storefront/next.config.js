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
    // WebP only — deliberately NOT avif. Next tries formats in order and
    // avif encoding is an order of magnitude slower than webp, paid on the
    // first request for every (url, width) pair. That cost scales with the
    // output width, which is why a product page's small thumbnails (w=64)
    // appeared instantly while the main image — the SAME source file at
    // w=1920/2048 — visibly lagged behind them. The source images are
    // already .webp, so avif was buying a marginal size win for a large
    // latency hit on exactly the image that matters most.
    formats: ["image/webp"],
    // Trimmed from the default [...,2048,3840]. Nothing in this layout
    // renders wider than ~1200 CSS px (main product image is 55vw), so the
    // top two buckets only ever produced needlessly huge encodes — the
    // browser could pick 3840w on a high-DPR screen and wait on it.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
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

  async headers() {
    const isProd = process.env.NODE_ENV === "production"

    // Origin of the Medusa backend, which the browser calls directly (SDK
    // requests, the public newsletter form). Derived from the same env var
    // next/image uses so the two can't drift apart.
    const backendOrigin = (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).origin
      } catch {
        return null
      }
    })()

    // Every third-party origin the BROWSER contacts. Server-side calls
    // (Europarcel, Nominatim, Oblio, Brevo) are deliberately absent — CSP only
    // governs the page, and listing them would imply a reach the browser
    // doesn't have.
    const GOOGLE_TAG = "https://www.googletagmanager.com"
    const GOOGLE_ANALYTICS = "https://*.google-analytics.com"
    const GOOGLE_ANALYTICS_WWW = "https://www.google-analytics.com"
    const GOOGLE_ANALYTICS_REGION = "https://*.analytics.google.com"
    // reCAPTCHA v3: api.js is served from www.google.com, its payload and the
    // challenge iframe from www.gstatic.com.
    const RECAPTCHA = "https://www.google.com"
    const RECAPTCHA_STATIC = "https://www.gstatic.com"
    // Leaflet basemap tiles for the checkout locker picker.
    const MAP_TILES = "https://*.basemaps.cartocdn.com"

    const csp = {
      "default-src": ["'self'"],

      // 'unsafe-inline' is required and cannot currently be removed: Next.js
      // injects inline hydration scripts, and the Consent Mode v2 bootstrap in
      // google-analytics.tsx must run BEFORE gtag.js loads. The alternative is
      // a per-request nonce, which forces every page to render dynamically and
      // would give up this storefront's static generation — too high a price.
      //
      // So this directive is not an XSS shield; its value is the host
      // allowlist, which stops injected code pulling a payload from an
      // attacker-controlled domain.
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        GOOGLE_TAG,
        GOOGLE_ANALYTICS_WWW,
        RECAPTCHA,
        RECAPTCHA_STATIC,
        // React Refresh compiles components at runtime in dev only.
        ...(isProd ? [] : ["'unsafe-eval'"]),
      ],

      // Tailwind ships as a stylesheet, but Leaflet and framer-motion both set
      // inline style attributes, which this covers.
      "style-src": ["'self'", "'unsafe-inline'"],

      // data:/blob: cover next/image placeholders and client-side WebP
      // conversion in the admin-style upload paths.
      "img-src": [
        "'self'",
        "data:",
        "blob:",
        "https://media.thehunter.ro",
        "https://*.r2.dev",
        "https://*.s3.*.amazonaws.com",
        "https://*.s3.amazonaws.com",
        MAP_TILES,
        GOOGLE_TAG,
        GOOGLE_ANALYTICS_WWW,
        ...(backendOrigin ? [backendOrigin] : []),
        ...(isProd ? [] : ["http://localhost:*"]),
      ],

      // next/font/google self-hosts at build time, so no external font origin.
      "font-src": ["'self'", "data:"],

      "connect-src": [
        "'self'",
        GOOGLE_TAG,
        GOOGLE_ANALYTICS,
        GOOGLE_ANALYTICS_WWW,
        GOOGLE_ANALYTICS_REGION,
        RECAPTCHA,
        ...(backendOrigin ? [backendOrigin] : []),
        ...(isProd ? [] : ["http://localhost:*", "ws://localhost:*"]),
      ],

      // reCAPTCHA's challenge iframe, and the Google Maps embed on /contact.
      "frame-src": ["'self'", RECAPTCHA, RECAPTCHA_STATIC],

      // Clickjacking: refuse to be embedded anywhere. frame-ancestors is the
      // modern control; X-Frame-Options below repeats it for older browsers.
      "frame-ancestors": ["'none'"],

      // Nothing legitimately posts a form to another origin — the Netopia
      // handoff is a window.location navigation, which this does not affect.
      "form-action": ["'self'"],

      // Blocks <base> hijacking of relative URLs, and legacy plugin embeds.
      "base-uri": ["'self'"],
      "object-src": ["'none'"],

      "worker-src": ["'self'", "blob:"],
      "manifest-src": ["'self'"],
    }

    const cspValue = Object.entries(csp)
      .map(([directive, values]) => `${directive} ${values.join(" ")}`)
      .concat(isProd ? ["upgrade-insecure-requests"] : [])
      .join("; ")

    const securityHeaders = [
      { key: "Content-Security-Policy", value: cspValue },

      // Repeats frame-ancestors for browsers that predate CSP Level 2.
      { key: "X-Frame-Options", value: "DENY" },

      // Stops browsers second-guessing Content-Type. Matters most for the
      // user-uploaded files served from the media origin.
      { key: "X-Content-Type-Options", value: "nosniff" },

      // Send the full URL only to ourselves; cross-origin requests get just
      // the origin, so order and account URLs don't leak in Referer.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

      // No feature in this storefront needs these; denying them limits what an
      // injected script could reach for.
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ]

    // HSTS only in production: sending it from a local HTTP dev server would
    // pin the browser to https://localhost for the max-age and break dev.
    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      })
    }

    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

module.exports = withNextIntl(nextConfig)
