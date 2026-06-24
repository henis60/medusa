import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      // PlatiOnline ITSN webhook: preserve the raw body for the payment pipeline.
      matcher: "/hooks/plati-online",
      method: ["POST"],
      bodyParser: { preserveRawBody: true },
    },
  ],
})
