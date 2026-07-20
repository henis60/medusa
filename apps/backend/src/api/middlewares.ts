import { authenticate, defineMiddlewares } from "@medusajs/framework/http";
import multer from "multer";

const mediaUpload = multer({ storage: multer.memoryStorage() });

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
    {
      matcher: "/admin/media-library",
      method: ["POST"],
      middlewares: [mediaUpload.array("files")],
    },
  ],
});
