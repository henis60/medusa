# syntax=docker/dockerfile:1
# Build context = repo root (so we can use the committed root lockfile).
FROM node:20-slim

WORKDIR /app

# 1) Install workspace deps from the committed root lockfile.
#    Copy only the manifests first so Docker caches this layer across
#    deploys whenever dependencies haven't changed.
#    Resolve deps fresh ON LINUX (drop the lockfile first) so platform-specific
#    native packages (e.g. @swc/core-linux-x64-gnu) are installed. A
#    Windows-generated lockfile omits those entries, and neither `npm ci` nor
#    `npm install` heals them when the lockfile is present. --legacy-peer-deps
#    keeps the from-scratch resolve fast (no peer backtracking).
COPY package.json package-lock.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/storefront/package.json ./apps/storefront/package.json
RUN rm -f package-lock.json && npm install --legacy-peer-deps --no-audit --no-fund

# 2) Build the backend (compiles the server + bundles the admin dashboard).
#    NODE_OPTIONS heap headroom is scoped to THIS build step only — at runtime a
#    high heap limit on a small container makes V8 skip GC and get OOM-killed.
#    VITE_STOREFRONT_URL must be present HERE: the admin is a Vite bundle and
#    Vite inlines import.meta.env.VITE_* at BUILD time. Setting it only in the
#    runtime environment has no effect on the already-compiled admin JS, so the
#    preview links would fall back to http://localhost:8000. Pass it as a build
#    arg (e.g. on Railway declare the ARG so the service variable is forwarded).
ARG VITE_STOREFRONT_URL
ENV VITE_STOREFRONT_URL=${VITE_STOREFRONT_URL}
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# 3) Install production-only deps for the built server output.
WORKDIR /app/apps/backend/.medusa/server
RUN npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit --no-fund

ENV NODE_ENV=production
EXPOSE 9000

# Run DB migrations, then start the server.
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
