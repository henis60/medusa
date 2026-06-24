import { PlatiOnlineOptions } from "./types"

/**
 * Loads PlatiOnline options from environment variables. Used both by
 * `medusa-config.ts` (to configure the provider) and by the ITSN route
 * (which runs outside the provider's container).
 *
 * RSA keys may be provided either as raw PEM (with real newlines) or with
 * `\n` escapes (convenient for single-line .env values).
 */
export function loadPlatiOnlineOptionsFromEnv(
  env: NodeJS.ProcessEnv = process.env
): PlatiOnlineOptions {
  const normalizeKey = (value?: string) => (value ?? "").replace(/\\n/g, "\n")

  return {
    login: env.PO_LOGIN ?? "",
    website: env.PO_WEBSITE ?? "",
    poPublicKey: normalizeKey(env.PO_PUBLIC_KEY),
    merchantPrivateKey: normalizeKey(env.PO_PRIVATE_KEY),
    ivAuth: env.PO_IV_AUTH ?? "",
    ivItsn: env.PO_IV_ITSN ?? "",
    relayUrl: env.PO_RELAY_URL ?? "",
    relayMethod: (env.PO_RELAY_METHOD as PlatiOnlineOptions["relayMethod"]) ?? "PTOR",
    baseUrl: env.PO_BASE_URL || undefined,
    testMode: env.PO_TEST_MODE === "true",
  }
}
