const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

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
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
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
      // Cloudflare R2 public dev URLs (product images)
      {
        protocol: "https",
        hostname: "*.r2.dev",
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

module.exports = nextConfig
