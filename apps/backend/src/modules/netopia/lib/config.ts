import { NetopiaOptions } from "./types";

export function loadNetopiaOptionsFromEnv(): NetopiaOptions {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:9000";
  const storefrontUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000";

  // NETOPIA_API_KEY = scurtul string generat din Profile → Security → API Keys
  // NETOPIA_SECRET  = cheia RSA privată (pentru semnare/IPN, NU pentru Authorization)
  const apiKey = process.env.NETOPIA_API_KEY || "";
  const posSignature =
    process.env.NETOPIA_ID || process.env.NETOPIA_POS_SIGNATURE || "";

  return {
    apiKey,
    posSignature,
    publicKey: process.env.NETOPIA_PUBLIC || "",
    sandbox:
      process.env.NETOPIA_SANDBOX !== "false" &&
      process.env.NETOPIA_TEST_MODE !== "false",
    notifyUrl: process.env.NETOPIA_NOTIFY_URL || `${backendUrl}/hooks/netopia`,
    redirectUrl:
      process.env.NETOPIA_REDIRECT_URL ||
      `${backendUrl}/hooks/netopia/complete`,
    language: process.env.NETOPIA_LANGUAGE || "ro",
  };
}
