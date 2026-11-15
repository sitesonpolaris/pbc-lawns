@AGENTS.md

# PBC Lawn Service — client notes

**PBC = Perfection by Cooper.** Affordable lawn care, Charlotte NC area. Tagline: "Affordable lawn service that perfects quality over quantity."
Redesign of https://www.pbclawns.com (Wix). Built by Sites on Polaris.

## Deploy
- Live: https://pbc-lawns.netlify.app · Netlify project `pbc-lawns`, site id `fe9198ed-2412-4a1c-83e7-b9b2d8079c50` (team sitesonpolaris).
- First deploys were uploads via the Netlify MCP deploy command. Link the GitHub repo in Netlify (Project configuration → Build & deploy → Link repository) for continuous deploy.
- Cloud sessions: use the `pbc-lawns` environment (allows the Supabase host and Netlify deploy hosts). Run `next start` with `NODE_USE_ENV_PROXY=1` so server fetches go through the proxy.

## Contact (from current site)
- Phone (704) 219-0676 · pbc.lawns@gmail.com
- No address, hours or service-area towns are published. Inferred "Charlotte, NC and surrounding towns" (704 code + job photos). **OWNER-CONFIRM.**

## Stack
- Next.js 16.4 (App Router, `cacheComponents` + `partialPrefetching` on), Tailwind v4 via the Turbopack loader (no PostCSS file).
- Supabase project **PBC Lawns** `sexkdqsnkqawwaufhuub` (us-east-1). Schema in `supabase/migrations/`.
- Square Invoices via REST (`src/lib/square.ts`), webhook at `/api/square/webhook`.
- Auth reads (`createClient`) call `connection()` first; every session read sits inside `<Suspense>`. Portal/admin layouts set `instant = false`.
- `proxy.ts` (formerly middleware) refreshes the session and redirects signed-out users from `/portal` and `/admin`.

## Roles
- `profiles.role`: `admin` | `customer`. Signing up as **pbc.lawns@gmail.com** auto-promotes to admin (trigger `handle_new_user`).
- A customer record links to a login by matching email (on signup, on customer create/update, or on "Make customer" from the inbox).
- RLS: customers read only their own rows (drafts hidden), admins read/write all, anonymous visitors may only insert `submissions`.

## Env vars (Netlify)
| Var | Notes |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | https://sexkdqsnkqawwaufhuub.supabase.co |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | sb_publishable_… (public) |
| NEXT_PUBLIC_SITE_URL | live URL, used in auth emails |
| SUPABASE_SERVICE_ROLE_KEY | server only: Square webhook + portal invites |
| SQUARE_ENVIRONMENT | `production` or `sandbox` |
| SQUARE_ACCESS_TOKEN / SQUARE_LOCATION_ID | from Square Developer dashboard |
| SQUARE_WEBHOOK_SIGNATURE_KEY | from the webhook subscription |

Supabase Auth settings to set in the dashboard: Site URL = live URL; add `<live>/auth/callback` to Redirect URLs.

## Identity
- Palette "Turf & Crown": turf #10291B, stripe #2E6B3A / #3F8A48, crown gold #E0B23A (accent only), ink #0C0E0B, ground #F3F5EF, mist #E4EADF.
- Fonts: Fraunces (display, echoes the logo's serif PBC) + Figtree (body), self-hosted from @fontsource.
- Motif: mower stripes (hard-edged alternating bands, `.stripes`/`.stripes-turf`), crown from the logo.
- Live thing: drag-to-compare before/after slider (`BeforeAfter`, `WorkCompare`) using real jobs.
- Real-world look: Charlotte-area subdivisions (vinyl siding, tan brick), diagonal/cross stripe mowing, black dyed mulch with hand-trenched edges, white Silverado + white enclosed trailer with PBC logo, orange stand-on mower, stacked-block tree rings.

## Media
- All from the client's Google Drive folder (owner mr.shepeard@gmail.com). Two "flowerbed" images in the Drive look like stock photos and are **not used**.
- `public/images/work/*` before/after pairs are real PBC jobs. The house number "7016" is visible in one pair (also on the old site).

## Old URL redirects (next.config.ts)
/copy-of-services → /work · /book-online → /quote · /booking-calendar/* → /quote · /service-page/* → /services · /members-area/* → /portal

## Owner to confirm
- Service-area towns, business hours, Google review link (`site.reviewUrl`).
- About-page wording ("fewer yards, finished properly") is our copy from the tagline.
- Default service agreement text (`src/lib/contract-template.ts`) — have it reviewed before use.
- No prices published ("Price varies"); none invented.
