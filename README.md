# Everwear — in-store demo

A frontend-only React SPA modelled on the H&M storefront, built as a clickable demo for an
innerwear retail client. No backend, no API calls, no auth — all product data and imagery are local.

**Live:** https://everwear-frontend-seven.vercel.app

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | ESLint |
| `npm run assets` | Regenerate placeholder imagery **and** `src/data/products.ts` |

## Pages

| Route | Page |
|---|---|
| `/` | Landing — hero, offer countdown, campaign pair, `NEW IN` grid, category tiles |
| `/shop` | Listing — tabs, sticky result bar, 4-up grid, filter drawer, load more |
| `/product/:slug` | Product detail — gallery mosaic, sticky buy column, three rails |
| `/wishlist` | Saved items |

Filters are URL-driven, so any filtered view is a shareable link:
`/shop?q=trunks&scope=men&packSizes=5&sort=price-asc`

## Rebranding

Everything client-facing is in `src/data/site.ts` — brand name (rendered as a text wordmark, not an
image), promo bar copy, offer and countdown, navigation, footer columns, legal line. Colours and
spacing are CSS custom properties in `src/styles/tokens.css`; `--c-brand` alone re-skins the logo,
promo bar and hero headline.

## Product catalogue

`src/data/products.ts` is **generated** — don't edit it. The source of truth is the `CATALOG` array
in `scripts/generate-assets.mjs`. Add a row there and run `npm run assets`; it writes the catalogue
and every placeholder image for the new product.

## Imagery

Placeholder SVGs today. Real photography drops into the same paths with no code changes — the
folder layout, export sizes and the three requirements that actually matter are documented in
[`public/images/README.md`](public/images/README.md).

## Deployment

Hosted on Vercel via its GitHub integration — there is no deploy workflow to maintain.

| Action | Result |
|---|---|
| Push to `develop` | Preview deployment at its own URL |
| Open a PR into `main` | Preview deployment, link posted on the PR |
| Merge into `main` | Production deployment to the live URL |

Work on `develop`, open a PR into `main`, check the preview, merge. A failing build leaves the last
good production deployment in place, so a broken merge means a stale site, not a down one.

`vercel.json` carries two settings that matter:

- **SPA rewrite** — routes like `/product/:slug` have no file on disk, so every non-asset request is
  rewritten to `index.html` for React Router to resolve. Without it, loading or refreshing any URL
  other than `/` returns a 404.
- **Cache headers** — `/assets/*` is content-hashed by Vite and cached immutably for a year.
  `/images/*` is deliberately left on Vercel's revalidating default, so replacing placeholder
  artwork with real photography shows up immediately instead of being cached for a year.

## Design reference

[`Implementation plan.md`](Implementation%20plan.md) maps the H&M pages this is modelled on,
component by component, marking what was confirmed from screenshots versus inferred. Read it before
changing layout — several details that look like mistakes (visible seams between grid cells, product
tiles with no text on the home page, the caption pinned to the bottom of the viewport during the
campaign section) are deliberate matches to the reference.
