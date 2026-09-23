# Aurum Auto Detailing

Mobile car detailing booking site for **Aurum Auto Detailing** (Tustin, CA —
(714) 942-4780). Built with Vite + React, a Cloudflare Worker + D1 database
for bookings, and Stripe for payments. Deploys to Cloudflare Pages via
GitHub Actions.

## Stack

- **Frontend:** Vite, React 18, React Router, date-fns, Stripe.js +
  @stripe/react-stripe-js, lucide-react, react-hot-toast
- **Backend:** Cloudflare Worker (`worker/index.js`) + D1 (SQLite)
- **Payments:** Stripe PaymentIntents (Card, Apple Pay, Google Pay, Link via
  `automatic_payment_methods`)
- **Hosting:** Cloudflare Pages, deployed from GitHub Actions

## Project structure

```
├── public/
│   ├── images/            # logo + gallery photos
│   └── favicon*.png/.ico  # generated favicon set
├── src/
│   ├── components/        # Navbar, Hero, Services, About, Gallery, Reviews,
│   │                         CTABanner, MapSection, Footer, MobileActionBar,
│   │                         BookingHeader, BookingActionBar, StripePaymentForm
│   ├── pages/              # Home, Book, Checkout, Confirmation, NotFound
│   ├── data/services.js    # single source of truth for pricing
│   ├── lib/                # api.js (Worker client), slots.js, useReveal.js
│   └── styles/             # one CSS file per component/page
├── worker/index.js         # Cloudflare Worker (D1 + Stripe)
└── .github/workflows/deploy.yml
```

## 1. Local setup

```bash
npm install
npm run dev
```

Copy `.env.local` (already included) and update it once you have your real
keys:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_...
VITE_API_URL=https://aurum-detailing-worker.YOUR_SUBDOMAIN.workers.dev
```

`.env.local` is intentionally **not** gitignored — the Stripe *publishable*
key is safe to ship to the browser. Never put the Stripe *secret* key here.

## 2. Cloudflare D1 database

1. Cloudflare dashboard → **Workers & Pages → D1** → Create database
   (e.g. `aurum-detailing-db`).
2. No manual schema setup needed — the Worker calls `ensureSchema()` on
   every non-payment request and creates the `bookings` table with
   `CREATE TABLE IF NOT EXISTS` if it doesn't already exist.

## 3. Cloudflare Worker

1. **Workers & Pages → Create → Worker**, name it e.g.
   `aurum-detailing-worker`, and paste in `worker/index.js`.
2. **Settings → Bindings → D1 Database** → bind variable name `DB` to the
   database you created above.
3. **Settings → Variables and Secrets** → add secret `STRIPE_SECRET_KEY`
   with your Stripe secret key (`sk_live_...` / `sk_test_...`).
4. Deploy the Worker and copy its `*.workers.dev` URL into
   `VITE_API_URL` in `.env.local`.

### API surface

| Method | Path                        | Purpose                                   |
|--------|-----------------------------|--------------------------------------------|
| GET    | `/api/availability?date=`   | Returns booked time slots for a date       |
| POST   | `/api/bookings`              | Creates a booking row                      |
| POST   | `/api/create-payment-intent` | Creates a Stripe PaymentIntent (server-priced) |
| POST   | `/api/confirm-payment`       | Marks a booking as Paid                    |
| GET    | `/api/coupon?code=`          | Validates the `PREPAY` coupon              |
| PATCH  | `/api/bookings/:id`          | Admin-dashboard compatible reschedule/patch |

The Worker **never trusts a client-sent price** — it recalculates the total
from the booking's stored `service` string against a server-side price map
before creating the PaymentIntent.

## 4. Stripe

1. Stripe dashboard → **Developers → API keys** → copy the publishable key
   into `.env.local` and the secret key into the Worker secret above.
2. No webhook is required for the current flow — the client confirms
   payment via `stripe.confirmPayment()` and then calls
   `/api/confirm-payment`. For stronger guarantees in production, consider
   adding a Stripe webhook that also flips `payment_status` server-side.

## 5. GitHub + Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to
   Git** and select the repo, **or** rely purely on the included GitHub
   Actions workflow (`.github/workflows/deploy.yml`), which builds and
   publishes with `cloudflare/pages-action`.
3. In your GitHub repo → **Settings → Secrets and variables → Actions**,
   add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Set the Pages project name to `aurum-auto-detailing` (or edit
   `projectName` in `deploy.yml` to match whatever you create).
5. Push to `main` — the workflow builds (`npm run build`) and deploys the
   `dist` folder automatically.
6. `public/_redirects` is already included so client-side routing
   (`/book`, `/checkout`, `/confirmation`) works correctly on Pages.

## Business details baked into this build

- **Basic Detail — $150:** Triple-stage vacuuming, complete interior wipe-down,
  floor mat cleaning & restoration.
- **Premium Detail — $200:** Triple-stage vacuuming, cabin application, dust
  elimination, interior window cleaning, deep carpet cleaning, cloth & carpet
  extraction, full interior shampooing, UV-protectant coating.
- **Exterior Wash — +$50 add-on:** Hand-washed exterior, detailed rim cleaning,
  tire scrub & degrease, door jamb & panel wipe-down, premium tire shine,
  spot-free hand drying.
- Booking hours: 8:00 AM – 4:30 PM, 30-minute slots, open all 7 days.
- Mobile bottom action bar (Call Now / Book Online) appears after scrolling
  past the hero on the main site, and is replaced by a sticky Continue/Back
  bar during the booking flow.

## Design notes

Brand palette (jet black `#0a0a0a`, gunmetal chrome, racing red `#c11e22`)
was pulled directly from the Aurum logo. Typography pairs Rajdhani
(headings) with Oswald (eyebrows/buttons) and Inter (body copy). The layout
— asymmetric split hero with a diagonal image divider, floating stat cards,
horizontally-scrolling service cards, and a masonry gallery — is unique to
this build within the broader site portfolio.
