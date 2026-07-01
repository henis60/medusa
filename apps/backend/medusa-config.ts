import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { loadEawbOptionsFromEnv } from './src/modules/eawb/lib/config'
import { loadNetopiaOptionsFromEnv } from './src/modules/netopia/lib/config'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const netopiaOptions = loadNetopiaOptionsFromEnv()
const netopiaConfigured = [
  netopiaOptions.apiKey,       // NETOPIA_SECRET
  netopiaOptions.posSignature, // NETOPIA_ID
].every(Boolean)

const paymentProviders = netopiaConfigured
  ? [
      {
        resolve: "./src/modules/netopia",
        id: "netopia",
        options: { ...netopiaOptions, capture: true },
      },
    ]
  : []

const eawbOptions = loadEawbOptionsFromEnv()
const eawbFulfillmentProviders = [
  // Manual provider is always included so existing shipping options continue to work
  {
    resolve: "@medusajs/fulfillment-manual",
    id: "manual",
  },
  ...(eawbOptions.api_key
    ? [
        {
          resolve: "./src/modules/eawb",
          id: "eawb",
          options: eawbOptions,
        },
      ]
    : []),
]

// Use S3 (Cloudflare R2) for file storage when its env vars are present, so
// uploads persist across redeploys and get public URLs. Falls back to the
// local provider (container disk) for local dev without R2 credentials.
const s3Configured = [
  process.env.S3_FILE_URL,
  process.env.S3_ACCESS_KEY_ID,
  process.env.S3_SECRET_ACCESS_KEY,
  process.env.S3_BUCKET,
  process.env.S3_ENDPOINT,
].every(Boolean)

const fileProvider = s3Configured
  ? {
      resolve: "@medusajs/file-s3",
      id: "s3",
      options: {
        file_url: process.env.S3_FILE_URL,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        region: "auto", // Cloudflare R2 uses "auto"
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
      },
    }
  : {
      resolve: "@medusajs/file-local",
      id: "local",
      options: {
        // Local fallback: public base URL for served files. On Railway set
        // BACKEND_URL to the public domain so uploaded files get reachable URLs.
        backend_url: `${process.env.BACKEND_URL ?? "http://localhost:9000"}/static`,
      },
    }

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: eawbFulfillmentProviders,
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: paymentProviders,
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/brevo-notification",
            id: "brevo",
            options: {
              channels: ["email"],
              apiKey: process.env.BREVO_API_KEY,
              from: process.env.BREVO_FROM_EMAIL,
              fromName: process.env.BREVO_FROM_NAME,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [fileProvider],
      },
    },
  ],
})
