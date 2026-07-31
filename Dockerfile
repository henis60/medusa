# syntax=docker/dockerfile:1
# Build context = repo root (so we can use the committed root lockfile).
FROM node:20-slim
RUN npm install -g npm@10.9.2

WORKDIR /app

# 1) Install workspace deps.
#    Copy only the manifests first so Docker caches this layer across
#    deploys whenever dependencies haven't changed.
#    Resolve deps fresh ON LINUX (drop the lockfile first) so platform-specific
#    native packages (e.g. @next/swc-linux-x64-gnu, @esbuild/linux-x64) are
#    installed. The committed lockfile is generated on Windows and only pins
#    Windows-platform optional deps (verified: package-lock.json has
#    @esbuild/win32-x64 but no Linux esbuild/rollup variants at all) — `npm ci`
#    against it can't heal that, and forces npm to fall back to live registry
#    resolution for the missing platform packages mid-install, which is what
#    made this step hang for 20+ minutes on Railway instead of the ~4 minutes
#    it takes locally on Windows (where the lockfile already matches).
COPY package.json package-lock.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/package.json
ENV NPM_CONFIG_FETCH_RETRIES=10
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=30000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=600000
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

# Start the server only. DB migrations run via Railway's Pre-Deploy Command
# (`npx medusa db:migrate`) so they execute once per deploy instead of on every
# replica boot (faster starts, no migration races across replicas).
CMD ["sh", "-c", "npm run start"]
