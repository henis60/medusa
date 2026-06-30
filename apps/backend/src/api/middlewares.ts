import { defineMiddlewares } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      // Netopia IPN: preserve raw body for JSON parsing (sent as text/plain)
      matcher: "/hooks/netopia",
      method: ["POST"],
      bodyParser: { preserveRawBody: true },
    },
  ],
});
