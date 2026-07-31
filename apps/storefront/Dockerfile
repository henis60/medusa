# syntax=docker/dockerfile:1
# Storefront (Next.js) image for Railway.
# Build context = repo ROOT. In the Railway service settings set:
#   - Root Directory: (leave empty / repo root)
#   - Dockerfile Path: apps/storefront/Dockerfile

# ---- Builder: install deps and build the standalone output ----
FROM node:20-slim AS builder
RUN npm install -g npm@10.9.2
WORKDIR /app

# Resolve deps fresh ON LINUX so platform-specific native packages (e.g.
# @next/swc-linux-x64-gnu) are installed. The root package-lock.json is
# generated on Windows and only pins Windows-platform optional deps — `npm ci`
# against it can't heal that, forcing npm to fall back to live registry
# resolution for the missing platform packages mid-install. Installing
# standalone (storefront's package.json copied in AS the root one, no
# workspace, no lockfile) also avoids pulling the backend's deps into this
# image, which a root-lockfile-based install would otherwise resolve too.
COPY apps/storefront/package.json ./package.json
COPY .npmrc ./.npmrc
RUN npm install --include=dev --legacy-peer-deps --no-audit --no-fund

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so they
# must be present now (not only at runtime). On Railway declare these ARGs so the
# matching service variables are forwarded into the build. If PUBLISHABLE_KEY is
# missing the build fails fast via check-env-variables.js — that's intentional.
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL}
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}

# Build. Heap headroom is scoped to THIS step only. `output: "standalone"` in
# next.config.js emits .next/standalone with a minimal server + traced deps.
COPY apps/storefront ./
RUN NODE_OPTIONS=--max-old-space-size=2048 npm run build

# ---- Runner: copy only the standalone output for a small runtime image ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Force binding to all interfaces; otherwise Next's standalone server can pick up
# the container HOSTNAME and become unreachable behind Railway's proxy.
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# next/image optimization needs sharp at runtime. The standalone tracer can miss
# its native binaries, so install sharp in isolation and merge it (and its deps)
# into the standalone node_modules.
RUN mkdir -p /tmp/sharp && cd /tmp/sharp \
    && npm init -y >/dev/null 2>&1 \
    && npm install sharp --no-audit --no-fund --legacy-peer-deps \
    && cp -a /tmp/sharp/node_modules/. /app/node_modules/ \
    && rm -rf /tmp/sharp

EXPOSE 8000
# Next's standalone server honors $PORT (injected by Railway) and $HOSTNAME.
CMD ["sh", "-c", "node server.js"]
