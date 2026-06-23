# syntax=docker/dockerfile:1
# Build context = repo root (so we can use the committed root lockfile).
FROM node:20-slim

# Medusa's admin (Vite) bundle is memory-hungry — give the build heap headroom.
ENV NODE_OPTIONS=--max-old-space-size=4096
WORKDIR /app

# 1) Install workspace deps from the committed root lockfile.
#    Copy only the manifests first so Docker caches this layer across
#    deploys whenever dependencies haven't changed.
#    `npm ci` installs straight from the lockfile (no graph resolution
#    and no peer-dep backtracking) — that's what kills the multi-minute hang.
COPY package.json package-lock.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/storefront/package.json ./apps/storefront/package.json
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# 2) Build the backend (compiles the server + bundles the admin dashboard).
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npm run build

# 3) Install production-only deps for the built server output.
WORKDIR /app/apps/backend/.medusa/server
RUN npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit --no-fund

ENV NODE_ENV=production
EXPOSE 9000

# Run DB migrations, then start the server.
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
