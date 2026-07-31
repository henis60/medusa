# syntax=docker/dockerfile:1
# Build context = repo root (so we can use the committed root lockfile).
FROM node:20-slim

WORKDIR /app

# 1) Install backend's own deps only from the committed root lockfile.
#    The storefront's package.json used to be copied in too, resolving the
#    whole monorepo (backend + storefront) together — that dragged ~1000+
#    irrelevant storefront packages into the backend's registry resolution
#    for no reason, adding unnecessary exposure to registry rate limits.
#    Copy only the manifest first so Docker caches this layer across deploys
#    whenever dependencies haven't changed.
#    The lockfile is regenerated on Linux (via WSL) so it includes every
#    platform's optional native packages (verified: @esbuild/linux-x64,
#    @swc/core-linux-x64-gnu, @img/sharp-linux-x64, @rollup/rollup-linux-x64-gnu
#    are all present) — a prior lockfile generated on Windows only had
#    Windows-platform variants, which made `npm ci` fall back to live
#    registry resolution for the missing platform packages mid-install and
#    hang for 20+ minutes. With a Linux-inclusive lockfile, `npm ci` is fast
#    and deterministic (~48s locally) since it never needs to resolve
#    anything live from the registry.
COPY package.json package-lock.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm ci --workspace apps/backend --include-workspace-root=false --legacy-peer-deps --no-audit --no-fund

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

# Start the server only. DB migrations run via Railway's Pre-Deploy Command
# (`npx medusa db:migrate`) so they execute once per deploy instead of on every
# replica boot (faster starts, no migration races across replicas).
CMD ["sh", "-c", "npm run start"]
