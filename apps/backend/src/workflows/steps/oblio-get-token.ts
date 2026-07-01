import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export const oblioGetTokenStep = createStep(
  "oblio-get-token",
  async (_input: undefined, { container }) => {
    const logger = container.resolve("logger")

    if (process.env.OBLIO_DRY_RUN === "true") {
      logger.info("Oblio DRY_RUN: token fictiv")
      return new StepResponse("dry-run-token")
    }

    const clientId = process.env.OBLIO_CLIENT_ID
    const clientSecret = process.env.OBLIO_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error("OBLIO_CLIENT_ID și OBLIO_CLIENT_SECRET lipsesc din .env")
    }

    const response = await fetch("https://www.oblio.eu/business/api/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Oblio autentificare eșuată: ${response.status} — ${text}`)
    }

    const data = await response.json()
    return new StepResponse(data.access_token as string)
  }
)
