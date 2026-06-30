import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { loadEawbOptionsFromEnv } from './src/modules/eawb/lib/config'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const paymentProviders: any[] = []

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
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              // Public base URL for served files. On Railway set
              // BACKEND_URL to the public domain so uploaded files get
              // reachable URLs (the AI route fetches them server-side).
              backend_url: `${process.env.BACKEND_URL ?? "http://localhost:9000"}/static`,
            },
          },
        ],
      },
    },
  ],
})
