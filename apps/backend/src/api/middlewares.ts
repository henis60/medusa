import { authenticate, defineMiddlewares } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      // Netopia IPN: preserve raw body for JSON parsing (sent as text/plain)
      matcher: "/hooks/netopia",
      method: ["POST"],
      bodyParser: { preserveRawBody: true },
    },
    {
      matcher: "/store/orders/:id/invoice",
      method: ["GET"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
});
