import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { loadPlatiOnlineOptionsFromEnv } from './src/modules/plati-online/lib/config'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const platiOnlineOptions = loadPlatiOnlineOptionsFromEnv()
// Only register PlatiOnline when configured, so the app still boots without credentials.
const paymentProviders = platiOnlineOptions.login
  ? [
      {
        resolve: "./src/modules/plati-online",
        id: "plati-online",
        options: platiOnlineOptions,
      },
    ]
  : []

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
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: paymentProviders,
      },
    },
  ],
})
