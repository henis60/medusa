import {
  authenticate,
  defineMiddlewares,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { timingSafeEqual } from "crypto";
import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

// Uploads are buffered in memory and then base64-encoded (which inflates them
// by ~33%) before being handed to the workflow, so an unbounded upload is an
// OOM waiting to happen — these caps are what keep a large batch from taking
// the whole backend process down.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB per file
const MAX_UPLOAD_FILES = 20;

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES },
});

// multer signals limit breaches as errors on the middleware, which would
// otherwise surface as an opaque 500. Translate them into the { message }
// shape the media-library UI already renders.
const mediaUploadWithLimits = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: (err?: unknown) => void
) => {
  mediaUpload.array("files")(req as any, res as any, (err: any) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: `Fișier prea mare. Limita este de ${
          MAX_UPLOAD_BYTES / (1024 * 1024)
        } MB per fișier.`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(413).json({
        message: `Prea multe fișiere. Maximum ${MAX_UPLOAD_FILES} per încărcare.`,
      });
    }
    return res.status(400).json({ message: "Încărcare invalidă." });
  });
};

// Same signal as medusa-config.ts's redisModules: with REDIS_URL set
// (staging/production), counters live in Redis and are shared across
// instances; without it (local dev), express-rate-limit falls back to its
// in-memory default — a single process has no one to share state with
// anyway.
const redisUrl = process.env.REDIS_URL;
const redisClient = redisUrl ? new Redis(redisUrl) : null;
// ioredis emits "error" on every connection hiccup (not just the initial
// connect) — with no listener, Node treats an unhandled EventEmitter "error"
// as an uncaught exception and crashes the whole process, taking every
// unrelated route down with it, not just the rate-limited ones. Logging is
// enough here; `passOnStoreError` below (not this listener) is what keeps
// individual requests working while Redis is unreachable.
redisClient?.on("error", (err) => {
  console.error("[rate-limit] Redis connection error:", err.message);
});

const redisStore = (prefix: string) =>
  redisClient
    ? new RedisStore({
        prefix,
        sendCommand: (...args: string[]) =>
          redisClient.call(
            ...(args as [string, ...string[]])
          ) as ReturnType<RedisStore["sendCommand"]>,
      })
    : undefined;

// The /store/eawb/* routes take a cart_id and return that cart's shipping
// address (geocoded coordinates, locality, courier quotes). They can't require
// customer auth — guest checkout uses them too, and a guest has no session —
// but they are only ever called by the storefront's server actions
// (lib/data/fulfillment.ts), never by the browser directly. A shared secret
// therefore closes them to the public internet without touching the guest flow.
//
// Enforced only when EAWB_INTERNAL_SECRET is configured, so deploying this
// ahead of the env var can't break checkout. Set it on BOTH the backend and the
// storefront to activate.
const eawbInternalSecret = process.env.EAWB_INTERNAL_SECRET;

if (!eawbInternalSecret) {
  console.warn(
    "[eawb] EAWB_INTERNAL_SECRET is not set — /store/eawb/* is reachable by " +
      "anyone who knows a cart id. Set it on the backend and the storefront to " +
      "restrict these routes to the storefront server."
  );
}

const requireInternalSecret = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: () => void
) => {
  if (!eawbInternalSecret) return next();

  const provided = req.headers["x-internal-secret"];
  const expected = eawbInternalSecret;

  // Length is compared first because timingSafeEqual throws on a mismatch, and
  // length alone is not the secret.
  const valid =
    typeof provided === "string" &&
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

  if (!valid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

// Shared 429 shape: matches the { error: string } responses these routes
// already return on validation failure, so the storefront's existing
// `res.status === 429` handling (contact/newsletter/appointment forms,
// login/signup/reset-password) needs no changes to pick this up.
const rateLimited = (message: string) =>
  (_req: MedusaRequest, res: MedusaResponse) => {
    res.status(429).json({ error: message });
  };

// Public, unauthenticated, reCAPTCHA-gated form endpoints — keyed by IP,
// generous enough for a real user retrying a typo but tight enough to blunt
// scripted abuse that gets past reCAPTCHA.
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // If Redis is unreachable, let the request through rather than block it —
  // degraded rate limiting beats a hard failure on every contact/newsletter
  // submission, login, or AI generation.
  passOnStoreError: true,
  store: redisStore("rl:form:"),
  handler: rateLimited("Prea multe încercări. Te rugăm să revii peste câteva minute."),
});

// Auth endpoints double as the brute-force surface — same window, same
// per-IP key, kept separate from the form limiter so a contact-form burst
// can't lock a customer out of login (or vice versa).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: redisStore("rl:auth:"),
  handler: rateLimited("Prea multe încercări. Te rugăm să revii peste câteva minute."),
});

// Admin-gated but Anthropic-metered: caps spend/abuse per admin session
// rather than guarding against anonymous traffic.
const aiGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: redisStore("rl:ai:"),
  handler: rateLimited("Prea multe cereri către AI. Te rugăm să revii peste câteva minute."),
});

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
      middlewares: [mediaUploadWithLimits],
    },
    {
      matcher: "/store/contact",
      method: ["POST"],
      middlewares: [publicFormLimiter],
    },
    {
      matcher: "/store/newsletter",
      method: ["POST"],
      middlewares: [publicFormLimiter],
    },
    {
      // Populates `req.auth_context` when the caller is a logged-in customer
      // without rejecting anonymous ones — the route itself decides what each
      // caller may do. Subscribing from the account page is authorised by this
      // session; anonymous subscribes still have to solve the reCAPTCHA.
      matcher: "/store/newsletter",
      method: ["GET", "POST", "DELETE"],
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    {
      // Reading and removing a subscription are cheap but enumerable, so they
      // get the same per-IP budget as the public form.
      matcher: "/store/newsletter",
      method: ["GET", "DELETE"],
      middlewares: [publicFormLimiter],
    },
    // Medusa's emailpass provider registers these four routes directly
    // (see @medusajs/medusa/dist/api/auth/middlewares.js) — matched
    // explicitly rather than with a wildcard, since path-to-regexp doesn't
    // treat a trailing "*" as a sub-path wildcard the way it looks like it
    // would.
    {
      matcher: "/auth/customer/emailpass",
      method: ["POST"],
      middlewares: [authLimiter],
    },
    {
      matcher: "/auth/customer/emailpass/register",
      method: ["POST"],
      middlewares: [authLimiter],
    },
    {
      matcher: "/auth/customer/emailpass/reset-password",
      method: ["POST"],
      middlewares: [authLimiter],
    },
    {
      matcher: "/auth/customer/emailpass/update",
      method: ["POST"],
      middlewares: [authLimiter],
    },
    {
      matcher: "/admin/ai/generate-product",
      method: ["POST"],
      middlewares: [aiGenerateLimiter],
    },
    // Matched individually rather than with "/store/eawb/*" — see the note on
    // the auth routes above about path-to-regexp not treating a trailing "*"
    // as a sub-path wildcard.
    {
      matcher: "/store/eawb/shipping-prices",
      method: ["GET"],
      middlewares: [requireInternalSecret],
    },
    {
      matcher: "/store/eawb/lockers",
      method: ["GET"],
      middlewares: [requireInternalSecret],
    },
    {
      matcher: "/store/eawb/geocode",
      method: ["GET"],
      middlewares: [requireInternalSecret],
    },
  ],
});
