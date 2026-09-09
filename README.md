# Labelwise

Labelwise is a full-stack nutrition search app built for the supplied technical assignment. A single demo user can search Open Food Facts in English, Dutch, German, or French. Basic product details are public; nutrition data is only serialized by the API when Stripe reports an active or trialing subscription.

## Stack and structure

- `apps/web`: Next.js App Router, React, TypeScript, Tailwind CSS
- `apps/api`: Express, TypeScript, Prisma, MySQL, Stripe, Open Food Facts
- `apps/api/prisma/migrations`: checked-in MySQL migration
- `apps/api/tests`: API, localization, incomplete-data, and access-policy tests

## Local setup

Prerequisites: Node.js 20.9+, pnpm 10+, Docker, and a Stripe test account.

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`; the API runs at `http://localhost:4000`.

## Vercel deployment

The repository includes a root `vercel.json` using Vercel Services. In the Vercel project's **Settings → Build and Deployment**, set **Framework Preset** to **Services**, then redeploy from `main`. The Next.js service handles `/`, while the Express service handles `/api/*` and `/health` on the same domain. Production browser requests therefore use relative API URLs and do not need `NEXT_PUBLIC_API_URL`.

Configure `DATABASE_URL`, `WEB_URL`, `OPEN_FOOD_FACTS_USER_AGENT`, and the Stripe variables from `.env.example` in the Vercel project. `DATABASE_URL` must point to a network-accessible MySQL database; the Docker hostname is only for local development.

For Stripe, create a recurring monthly test Price and add its `price_...` ID plus your test secret key to `.env`. Forward test webhooks while developing:

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Copy the displayed `whsec_...` value to `STRIPE_WEBHOOK_SECRET`, then restart the API. The webhook handles Checkout completion and subscription create/update/delete events. Configure Stripe's customer portal if you want the **Manage plan** action to work.

## Commands

```bash
pnpm test       # automated tests with API coverage
pnpm lint       # ESLint across both apps
pnpm typecheck  # strict TypeScript checks
pnpm build      # production builds
```

## Technical decisions

**Backend-enforced access.** The frontend never receives nutrition values for a free user. `hasNutritionAccess` accepts Stripe `active` and `trialing` states, and rejects an expired current period even if an out-of-order webhook temporarily leaves the status active.

**Webhook-driven subscription state.** Stripe is the source of truth, but access checks use locally stored state to avoid a Stripe API request on every product search. Processed event IDs make retries idempotent. Checkout attaches the demo user ID as both the client reference and subscription metadata.

**Provider isolation and incomplete data.** Open Food Facts is called only by the Express API with a descriptive User-Agent, a 10-second timeout, limited response fields, and a 12-item page. A mapper normalizes missing names, brands, images, nutrition fields, and Nutri-Score values. Provider failures return a controlled API error.

**Search history.** Successful searches are stored in MySQL for the fixed `demo-user`; the six most recent distinct terms are returned. This intentionally avoids authentication because the assignment specifies one demo user.

## Internationalization approach

UI copy lives in a typed four-locale dictionary. The manual selector changes interface text immediately and sends `en`, `nl`, `de`, or `fr` to the backend. Product mapping prefers `product_name_{locale}` and `generic_name_{locale}`, then falls back to the provider's default and English fields. Numbers are formatted with `Intl.NumberFormat` for the selected locale. Brand names are not translated because Open Food Facts does not model them as localized copy.

## Environment variables

All secrets stay server-side. Only `NEXT_PUBLIC_API_URL` is exposed to the browser. See `.env.example` for the complete list. Production should use separate origins, TLS, managed MySQL, and secret storage.

## Known limitations and simplifications

- There is intentionally one seeded demo identity and no authentication.
- Plain-text product search uses Open Food Facts' legacy full-text endpoint because its current v2/v3 APIs do not yet provide full-text search. The provider integration is isolated so it can be swapped for Search-a-licious when stable.
- Open Food Facts is community-maintained, so translations, images, and nutrition values can be missing or inaccurate.
- Search history is updated after a successful provider response; failed attempts are not stored.
- The demo supports one subscription product and no plan picker, coupons, taxes, or bespoke billing UI.
- Webhook event retention has no cleanup job in this small demo.

## API summary

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `GET` | `/api/user` | Demo user and access state |
| `GET` | `/api/products/search?query=&locale=` | Product search with server-side paywall |
| `GET` | `/api/searches/recent` | Six recent distinct searches |
| `POST` | `/api/billing/checkout` | Create monthly Stripe Checkout session |
| `POST` | `/api/billing/portal` | Open Stripe customer portal |
| `POST` | `/api/webhooks/stripe` | Verify and process Stripe webhooks |
