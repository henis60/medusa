import {
  authenticate,
  defineMiddlewares,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

const mediaUpload = multer({ storage: multer.memoryStorage() });

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
      middlewares: [mediaUpload.array("files")],
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
  ],
});
