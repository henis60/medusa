# syntax=docker/dockerfile:1
# Storefront (Next.js) image for Railway.
# Build context = repo ROOT. In the Railway service settings set:
#   - Root Directory: (leave empty / repo root)
#   - Dockerfile Path: apps/storefront/Dockerfile
FROM node:20-slim

WORKDIR /app

# The storefront is a leaf workspace (no internal @dtc/* deps), so we install it
# standalone instead of the whole monorepo — smaller image, faster builds.
# Resolve deps fresh ON LINUX so platform-specific binaries (Next.js SWC) are
# installed. --legacy-peer-deps keeps the from-scratch resolve fast under the
# React 19 peer ranges. --include=dev because the build needs Tailwind/TS/etc.
COPY apps/storefront/package.json ./package.json
COPY .npmrc ./.npmrc
RUN npm install --include=dev --legacy-peer-deps --no-audit --no-fund

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so they
# must be present now (not only at runtime). On Railway declare these ARGs so the
# matching service variables are forwarded into the build. If PUBLISHABLE_KEY is
# missing the build fails fast via check-env-variables.js — that's intentional.
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL}
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}

# Build the app. Heap headroom is scoped to THIS step only — a high runtime heap
# limit on a small container makes V8 skip GC and get OOM-killed.
COPY apps/storefront ./
RUN NODE_OPTIONS=--max-old-space-size=2048 npm run build

ENV NODE_ENV=production
EXPOSE 8000

# Bind to Railway's injected $PORT (falls back to 8000 locally). The package.json
# "start" script hardcodes "-p 8000", so we call next directly with $PORT.
CMD ["sh", "-c", "npx next start -p ${PORT:-8000}"]
