import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { loadPlatiOnlineOptionsFromEnv } from './src/modules/plati-online/lib/config'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const platiOnlineOptions = loadPlatiOnlineOptionsFromEnv()
// Register PlatiOnline only when ALL required options are present, so a partially
// configured env doesn't make the provider's validateOptions throw at boot and
// take down the whole app.
const platiOnlineConfigured = [
  platiOnlineOptions.login,
  platiOnlineOptions.website,
  platiOnlineOptions.poPublicKey,
  platiOnlineOptions.merchantPrivateKey,
  platiOnlineOptions.ivAuth,
  platiOnlineOptions.ivItsn,
  platiOnlineOptions.relayUrl,
].every(Boolean)

const paymentProviders = platiOnlineConfigured
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
