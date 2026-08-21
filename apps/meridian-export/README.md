# The Hunter Meridian — standalone export

A standalone Next.js (App Router) static export living at
`apps/meridian-export`, with zero dependency on the main storefront app or
its Medusa backend. Built for deployment to Cloudflare Pages as static
files.

## Routes

- `/` — the launch/homepage design (`public/index.html`), served as a pure
  static passthrough: it's the original hand-built HTML/CSS/JS file, copied
  in as-is, with no React/Next rendering involved. There is no
  `app/page.tsx` for this route — Next.js only builds `/meridian`, and the
  static export step copies everything under `public/` verbatim into `out/`,
  so this file becomes `out/index.html` untouched.
  - The "Online Shop" section was trimmed to only the first 2 accessory
    products (the other product card and the "disponibil în magazin" suit
    card were removed, and the grid CSS was changed from a 4-column to a
    2-column layout).
  - The countdown target and the "Disponibile online începând cu ..." copy
    were both updated to **28 August 2026**.
- `/meridian` — the Meridian event landing page (a real Next.js/React route,
  under `app/meridian/page.tsx`), with all of its original interactivity:
  Framer Motion reveal animations, the canvas globe, the theme-timeline
  light animation, and the program-row hover/scroll behavior.

## Develop / build locally

```bash
npm install
npm run build
```

`next build` (configured with `output: "export"`) produces a static `out/`
directory containing both routes.

## Deploy to Cloudflare

Cloudflare has folded Pages into Workers, and the newer Workers flow has no
dashboard field for the build output directory — it's configured in
`wrangler.jsonc` instead (`assets.directory: "./out"`).

Dashboard settings (Workers & Pages → Create → connect this repo):

- Root directory: `apps/meridian-export`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

There is no "output directory" field to fill in — `wrangler.jsonc` supplies
it. To verify the config locally without publishing:

```bash
npm run build
npx wrangler deploy --dry-run
```

Note: this package is deliberately excluded from the root `package.json`
`workspaces` globs (`!apps/meridian-export/**`) so it installs and builds
standalone with its own `package-lock.json`. Without that exclusion npm
would resolve it as a workspace member and install the whole monorepo
(backend + storefront) just to build this static site.

If you prefer the classic Pages flow instead (build output directory set in
the dashboard, no `wrangler.jsonc` needed), use build command
`npm run build` and output directory `out`.

## What's included for `/meridian`

- The four Google fonts (Playfair Display, Cormorant Garamond, Raleway,
  Cinzel) plus the local Montigny font, configured identically to the main
  app.
- Only the `:root` design tokens and `.thm-*` CSS rules `/meridian` actually
  needs — no Tailwind (the page uses none once `Nav` is removed).

## What was intentionally removed from `/meridian`

- The shared site `Nav` component — it performs live Medusa backend fetches
  (regions/locales/collections/categories), which this standalone export
  must not depend on. The hero section's own "Cumpără bilete" CTA is
  rendered independently of `Nav`, so ticket purchasing still works.
- i18n/next-intl — this export renders the single hardcoded Romanian version
  of the page, with no locale routing.

Note: `.thm-hero-shell` still subtracts a 64px nav height from its
`calc(100vh - 64px)` sizing carried over from the original page's CSS, but
since there's no header here that's been corrected to a plain `100vh`/
`100dvh` (same for `.thm-anchor-target`'s `scroll-margin-top`, set to `0`).

## Updating the homepage (`/`)

To change anything about the homepage, edit `public/index.html` directly —
it's a single self-contained file (inline `<style>` and `<script>`, no
build step of its own). Any images it references live under `public/images/`
at the same relative paths the file expects (`images/...`,
`images/products/...`).
