# Aurum Auto Detailing

Mobile car detailing site for Aurum Auto Detailing (Tustin, CA), live at
https://aurumautodetailing.site (no www; www redirects to it).
Vite + React 18, React Router, Stripe (Payment Element + Express Checkout), Cloudflare Pages,
and a Cloudflare Worker that stores bookings in the shared D1 database on the Remoticojobs account.

- Booking IDs start with `AUR-`, bookings are stored with `source = 'aurum-tustin'`.
- Services: Basic Detail $150 (about 1.5–2 hours), Premium Detail $200 (about 3–4 hours),
  Exterior Wash +$50 (add-on only, the Worker rejects it on its own). Same price for any vehicle.
  Coupon `PREPAY` = $15 off when paying online.
- Slots: start times 8:00 AM to 5:00 PM, every 30 minutes, 7 days a week, Pacific time,
  2-hour lead time. Keep `src/data/services.js` + `src/lib/slots.js` and `worker/worker.js` in sync.

## Build

```bash
npm install
npm run build   # vite build + SSR build + scripts/prerender.js
```

`scripts/prerender.js` writes one static HTML file per route (`dist/<slug>.html`) with its own
title, description, canonical, Open Graph tags and JSON-LD, writes `dist/sitemap.xml`, and fails the
build if a title is over 60 or a description over 160 characters. Booking, checkout and
confirmation ship head tags only (they render in the browser). There is no `_redirects` file:
Cloudflare Pages serves `dist/404.html` for unknown URLs, and `public/_headers` keeps
`*.pages.dev` out of search results.

## Where things live

- Business facts, hours, home FAQ, reviews, Google profile link: `src/data/business.js`
  (confirmed facts are listed at the top)
- Prices and package contents: `src/data/services.js`
- Head tags and schema: `src/lib/seo.js`
- Service and city landing pages (data): `src/lib/pages.js`, rendered by `src/pages/Landing.jsx`
- Reviews: `REVIEWS` in `src/data/business.js` (real Google reviews only; the section and its menu
  link stay hidden while the list is empty)
- Photos: `public/images/` (`gallery-1..6.jpg` are real Aurum photos), share image `public/og-image.jpg`

## Booking flow

1. `/book` creates the booking (`POST /api/bookings` with `serviceId` + `exteriorAddOn`). The Worker
   computes the price and stores the row as Pending / Incomplete.
2. `/checkout` creates a Stripe PaymentIntent for the server-computed total.
   - Card / Apple Pay / Google Pay / Link: after Stripe accepts the payment, the page calls
     `POST /api/bookings/:id/paid`. The Worker retrieves the PaymentIntent from Stripe and checks
     status, booking id, source and amount before marking the booking Paid.
   - "Pay later": `POST /api/bookings/:id/confirm` marks it Confirmed / Pay Later.
3. Either way the Worker sends one `booking_confirmed` event to the GHL webhook
   (`booking_notifications` makes sure it is sent only once).

## Worker

`worker/worker.js`, config in `worker/wrangler.jsonc` (account Remoticojobs, D1
`detailing-bookings-remoticojobs`, shared with Alera, Apex, Aventa and others; every query is
scoped by `source`). Deploy from `worker/`:

```bash
npx wrangler deploy
```

Secrets (dashboard → Workers → aurum-auto-detailing-v2 → Settings → Variables, or `wrangler secret put`):

| Name | Required | What |
|---|---|---|
| `STRIPE_SECRET_KEY` | yes | Same Stripe account as `VITE_STRIPE_PUBLISHABLE_KEY` |
| `GHL_WEBHOOK_URL` | yes | GoHighLevel inbound webhook for the booking email |
| `STRIPE_WEBHOOK_SECRET` | no | Signing secret for a Stripe webhook pointed at `/api/stripe-webhook` (refunds, backup for Paid) |
| `ADMIN_TOKEN` | no | `Authorization: Bearer <token>` for `GET/PATCH /api/bookings/:id` |

## Site deploy

Cloudflare Pages project `aurum-auto-detailing-v2` on Remoticojobs (direct upload, no Git connection):

```bash
npm run build
npx wrangler pages deploy dist --project-name aurum-auto-detailing-v2 --branch main
```

`.env.local` holds only public values (Stripe publishable key, Worker URL) and is committed on purpose.
