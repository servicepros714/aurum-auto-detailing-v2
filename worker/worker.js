// aurum-auto-detailing-v2
// Cloudflare Worker for Aurum Auto Detailing (Tustin). Based on the Alera worker (the
// standard on the Remoticojobs account), plus a verified "paid" route so card payments
// are confirmed without needing a Stripe webhook.
// Talks to the D1 database `detailing-bookings-remoticojobs`; every read/write is scoped
// by source = "aurum-tustin". Booking dates/times are California time.
//
// Secrets (`wrangler secret put <NAME>` or the dashboard):
//   STRIPE_SECRET_KEY      Stripe secret key (same account as VITE_STRIPE_PUBLISHABLE_KEY)
//   GHL_WEBHOOK_URL        GoHighLevel inbound webhook for the booking email
//   STRIPE_WEBHOOK_SECRET  optional: signing secret of a Stripe webhook -> /api/stripe-webhook
//   ADMIN_TOKEN            optional: `Authorization: Bearer <token>` for GET/PATCH /api/bookings/:id
//
// Deploy: `npx wrangler deploy` from the worker/ directory.

const SOURCE = 'aurum-tustin'
const BUSINESS_NAME = 'Aurum Auto Detailing'
const SOURCE_LABEL = 'Aurum Auto Detailing'
const PREFIX = 'AUR-'
const PREPAY_DISCOUNT = 15

// Source of truth for pricing (whole dollars). Must match src/data/services.js.
const SERVICES = {
  basic: { name: 'Basic Detail', price: 150 },
  premium: { name: 'Premium Detail', price: 200 }
}
const EXTERIOR_ADDON = { name: 'Exterior Wash', price: 50 }

const PATCHABLE = new Set([
  'status',
  'reschedule_date',
  'reschedule_time',
  'original_date',
  'original_time',
  'notes2',
  'payment_status'
])

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS }
  })
}

function newBookingId() {
  return `${PREFIX}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

function sqlTimestamp(date = new Date()) {
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

// Pricing and the Stripe PaymentIntent live in booking_payments; the shared bookings table has no such columns.
const BOOKING_WITH_PAYMENT = `SELECT b.*, p.subtotal, p.coupon, p.total, p.payment_intent_id
  FROM bookings b LEFT JOIN booking_payments p ON p.booking_id = b.id
  WHERE b.id = ? AND b.source = ?`

// Start times 8:00 AM – 5:00 PM every 30 minutes (must match src/lib/slots.js).
const TIME_SLOTS = (() => {
  const slots = []
  for (let mins = 8 * 60; mins <= 17 * 60; mins += 30) {
    const h = Math.floor(mins / 60), m = mins % 60
    const hour12 = h % 12 === 0 ? 12 : h % 12
    slots.push(`${hour12}:${m === 0 ? '00' : m} ${h >= 12 ? 'PM' : 'AM'}`)
  }
  return slots
})()

const TIME_ZONE = 'America/Los_Angeles'
const LEAD_MINUTES = 120

// Current California wall-clock date ("YYYY-MM-DD") and minutes since midnight.
function pacificNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date())
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    minutes: (Number(map.hour) % 24) * 60 + Number(map.minute)
  }
}

function slotMinutes(slot) {
  const [time, ampm] = slot.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

// Returns an error message if date/time isn't bookable in California time.
function validateSlot(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Invalid date.'
  if (!TIME_SLOTS.includes(time)) return 'Invalid time slot.'
  const now = pacificNow()
  if (date < now.date) return 'That date has already passed.'
  if (date === now.date && slotMinutes(time) - now.minutes < LEAD_MINUTES) {
    return 'Same-day bookings need at least 2 hours notice.'
  }
  return null
}

function couponDiscount(code) {
  return (code || '').trim().toUpperCase() === 'PREPAY' ? PREPAY_DISCOUNT : 0
}

// Applies a coupon to a subtotal -> { coupon, total } (whole dollars).
function applyCoupon(subtotal, code) {
  const discount = couponDiscount(code)
  return { coupon: discount ? 'PREPAY' : null, total: Math.max(subtotal - discount, 0) }
}

async function timingSafeEqual(a, b) {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b))
  ])
  return crypto.subtle.timingSafeEqual(ha, hb)
}

async function isAdmin(request, env) {
  const header = request.headers.get('Authorization') || ''
  if (!env.ADMIN_TOKEN || !header.startsWith('Bearer ')) return false
  return timingSafeEqual(header.slice(7), env.ADMIN_TOKEN)
}

// Verifies a Stripe webhook signature (Stripe-Signature: t=...,v1=...,v1=...).
async function verifyStripeSignature(payload, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false
  const items = header.split(',').map(kv => kv.trim())
  const timestamp = Number((items.find(kv => kv.startsWith('t=')) || '').slice(2))
  const signatures = items.filter(kv => kv.startsWith('v1=')).map(kv => kv.slice(3))
  if (!timestamp || !signatures.length) return false
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSec) return false

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`))
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('')
  for (const sig of signatures) {
    if (await timingSafeEqual(sig, expected)) return true
  }
  return false
}

async function stripeRequest(env, path, params, method = 'POST') {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Payments are not configured.')
  const res = await fetch(`https://api.stripe.com${path}${method === 'GET' ? `?${params}` : ''}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: method === 'GET' ? undefined : params
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Stripe error')
  return data
}

// Reuse the Stripe customer for this email so repeat clients group together.
async function findOrCreateCustomer(env, booking) {
  const existing = await stripeRequest(env, '/v1/customers',
    new URLSearchParams({ email: booking.email, limit: '1' }), 'GET')
  if (existing.data.length) return existing.data[0].id

  const customer = await stripeRequest(env, '/v1/customers', new URLSearchParams({
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    'address[line1]': booking.address,
    'metadata[source]': SOURCE
  }))
  return customer.id
}

// Sends the booking to GHL once: the booking_notifications row is the claim, and is
// released if GHL didn't accept it so a later confirm or Stripe retry can send it again.
async function notifyBookingConfirmed(env, booking) {
  if (!env.GHL_WEBHOOK_URL) return
  const claim = await env.DB.prepare(
    `INSERT OR IGNORE INTO booking_notifications (booking_id, event, created_at) VALUES (?, 'booking_confirmed', ?)`
  ).bind(booking.id, new Date().toISOString()).run()
  if (!claim.meta.changes) return

  const res = await fetch(env.GHL_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: booking.id,
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      source: SOURCE,
      source_label: SOURCE_LABEL,
      vehicle: booking.vehicle,
      address: booking.address,
      notes: booking.notes,
      payment_status: booking.payment_status,
      total: booking.total,
      event_type: 'booking_confirmed'
    })
  }).catch(() => null)

  if (!res?.ok) {
    await env.DB.prepare(`DELETE FROM booking_notifications WHERE booking_id = ? AND event = 'booking_confirmed'`)
      .bind(booking.id).run()
  }
}

// Marks a booking Paid after a succeeded PaymentIntent, then sends the GHL email.
async function markPaid(env, ctx, bookingId, paymentIntentId) {
  await env.DB.batch([
    env.DB.prepare(`UPDATE bookings SET status = 'Confirmed', payment_status = 'Paid' WHERE id = ? AND source = ?`)
      .bind(bookingId, SOURCE),
    env.DB.prepare(`UPDATE booking_payments SET payment_intent_id = ? WHERE booking_id = ?`)
      .bind(paymentIntentId, bookingId)
  ])
  const paid = await env.DB.prepare(BOOKING_WITH_PAYMENT).bind(bookingId, SOURCE).first()
  if (paid) ctx.waitUntil(notifyBookingConfirmed(env, paid))
  return paid
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const { pathname } = url

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    try {
      if (pathname === '/api/health') return json({ ok: true, source: SOURCE })

      // GET /api/availability?date=YYYY-MM-DD -> { date, booked: [unavailable start times] }
      if (pathname === '/api/availability' && request.method === 'GET') {
        const date = url.searchParams.get('date')
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'date is required' }, 400)

        const { results } = await env.DB.prepare(
          `SELECT time FROM bookings WHERE date = ? AND source = ? AND status != 'Cancelled'`
        ).bind(date, SOURCE).all()

        const bookedTimes = new Set(results.map(r => r.time))
        // unavailable = booked, or already past / inside the lead window in California time
        const booked = TIME_SLOTS.filter(slot => bookedTimes.has(slot) || validateSlot(date, slot) !== null)
        return json({ date, booked })
      }

      // POST /api/bookings  { date, time, serviceId, exteriorAddOn, name, phone, email, vehicle, address, coupon }
      // Price is computed here from serviceId / exteriorAddOn / coupon — never taken from the client.
      if (pathname === '/api/bookings' && request.method === 'POST') {
        const body = await request.json()
        const required = ['date', 'time', 'serviceId', 'name', 'phone', 'email', 'address']
        for (const field of required) {
          if (!body[field]) return json({ error: `${field} is required` }, 400)
        }
        const service = SERVICES[body.serviceId]
        if (!service) return json({ error: 'Choose the Basic or Premium Detail (the Exterior Wash is an add-on).' }, 400)
        const slotError = validateSlot(body.date, body.time)
        if (slotError) return json({ error: slotError }, 400)

        // Prevent double-booking the same slot for this site.
        const clash = await env.DB.prepare(
          `SELECT id FROM bookings WHERE date = ? AND time = ? AND source = ? AND status != 'Cancelled'`
        ).bind(body.date, body.time, SOURCE).first()
        if (clash) return json({ error: 'That time slot was just booked. Please choose another.' }, 409)

        const addOn = body.exteriorAddOn === true
        const serviceName = addOn ? `${service.name} + ${EXTERIOR_ADDON.name}` : service.name
        const subtotal = service.price + (addOn ? EXTERIOR_ADDON.price : 0)
        const { coupon, total } = applyCoupon(subtotal, body.coupon)
        const id = newBookingId()
        const createdAt = sqlTimestamp()

        // Starts as Pending / Incomplete. /confirm (Pay Later) or a verified payment confirms it
        // and sends the GHL notification, so the email carries the real payment status.
        await env.DB.batch([
          env.DB.prepare(
            `INSERT INTO bookings
              (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at,
               status, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Incomplete')`
          ).bind(
            id, body.date, body.time, serviceName, String(body.name).slice(0, 120), String(body.phone).slice(0, 30),
            String(body.email).slice(0, 200), String(body.vehicle || '').slice(0, 120), String(body.address).slice(0, 250),
            String(body.notes || '').slice(0, 500), SOURCE, createdAt
          ),
          env.DB.prepare(`INSERT INTO booking_payments (booking_id, subtotal, coupon, total) VALUES (?, ?, ?, ?)`)
            .bind(id, subtotal, coupon, total)
        ])

        return json({ id, status: 'Pending', service: serviceName, subtotal, coupon, total }, 201)
      }

      // POST /api/bookings/:id/confirm   { email }
      // Customer chose Pay Later: the booking becomes Confirmed / Pay Later and GHL is notified.
      const confirmMatch = pathname.match(/^\/api\/bookings\/([^/]+)\/confirm$/)
      if (confirmMatch && request.method === 'POST') {
        const { email } = await request.json()
        const draft = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ? AND source = ?`)
          .bind(confirmMatch[1], SOURCE).first()
        if (!draft || draft.email !== email) return json({ error: 'Booking not found' }, 404)
        if (draft.status === 'Cancelled') return json({ error: 'This booking was cancelled.' }, 409)

        await env.DB.batch([
          env.DB.prepare(
            `UPDATE bookings SET status = 'Confirmed', payment_status = 'Pay Later', notes2 = 'Pay Later'
             WHERE id = ? AND source = ? AND status = 'Pending' AND payment_status = 'Incomplete'`
          ).bind(draft.id, SOURCE),
          // Pay Later pays the full price: drop any prepay coupon applied at checkout.
          env.DB.prepare(`UPDATE booking_payments SET coupon = NULL, total = subtotal WHERE booking_id = ? AND ? = 'Incomplete'`)
            .bind(draft.id, draft.payment_status)
        ])

        const booking = await env.DB.prepare(BOOKING_WITH_PAYMENT).bind(draft.id, SOURCE).first()
        ctx.waitUntil(notifyBookingConfirmed(env, booking))
        return json({ id: booking.id, confirmed: true, payment_status: booking.payment_status, total: booking.total })
      }

      // POST /api/bookings/:id/paid   { paymentIntentId }
      // After the card form succeeds: the Worker checks the PaymentIntent with Stripe (status,
      // booking id, source, amount) before marking the booking Paid. Never trusts the browser.
      const paidMatch = pathname.match(/^\/api\/bookings\/([^/]+)\/paid$/)
      if (paidMatch && request.method === 'POST') {
        const { paymentIntentId } = await request.json()
        if (!/^pi_[A-Za-z0-9_]+$/.test(paymentIntentId || '')) return json({ error: 'Invalid payment.' }, 400)
        const booking = await env.DB.prepare(BOOKING_WITH_PAYMENT).bind(paidMatch[1], SOURCE).first()
        if (!booking) return json({ error: 'Booking not found' }, 404)
        if (booking.payment_status === 'Paid') return json({ id: booking.id, paid: true, total: booking.total })

        const pi = await stripeRequest(env, `/v1/payment_intents/${paymentIntentId}`, new URLSearchParams(), 'GET')
        const ok = ['succeeded', 'processing'].includes(pi.status)
          && pi.metadata?.bookingId === booking.id
          && pi.metadata?.source === SOURCE
          && pi.amount === booking.total * 100
        if (!ok) return json({ error: 'We could not verify your payment.' }, 402)

        const paid = await markPaid(env, ctx, booking.id, pi.id)
        return json({ id: booking.id, paid: true, total: paid?.total })
      }

      // GET / PATCH /api/bookings/:id — admin only
      const bookingMatch = pathname.match(/^\/api\/bookings\/([^/]+)$/)
      if (bookingMatch && (request.method === 'GET' || request.method === 'PATCH') && !(await isAdmin(request, env))) {
        return json({ error: 'Unauthorized' }, 401)
      }
      if (bookingMatch && request.method === 'GET') {
        const row = await env.DB.prepare(BOOKING_WITH_PAYMENT).bind(bookingMatch[1], SOURCE).first()
        if (!row) return json({ error: 'Not found' }, 404)
        return json(row)
      }
      if (bookingMatch && request.method === 'PATCH') {
        const body = await request.json()
        const fields = Object.keys(body).filter(k => PATCHABLE.has(k))
        if (fields.length === 0) return json({ error: 'No patchable fields provided' }, 400)
        const setClause = fields.map(f => `${f} = ?`).join(', ')
        const values = fields.map(f => body[f])
        await env.DB.prepare(`UPDATE bookings SET ${setClause} WHERE id = ? AND source = ?`)
          .bind(...values, bookingMatch[1], SOURCE).run()
        return json({ ok: true })
      }

      // POST /api/validate-coupon  { code }
      if (pathname === '/api/validate-coupon' && request.method === 'POST') {
        const { code } = await request.json()
        const discount = couponDiscount(code)
        if (discount) return json({ valid: true, discount })
        return json({ valid: false, message: 'Invalid or expired code.' })
      }

      // POST /api/create-payment-intent  { bookingId, coupon }
      // The amount charged is the booking's server-computed total — any client amount is ignored.
      if (pathname === '/api/create-payment-intent' && request.method === 'POST') {
        const { bookingId, coupon: couponCode } = await request.json()
        if (!bookingId) return json({ error: 'bookingId is required' }, 400)

        const booking = await env.DB.prepare(BOOKING_WITH_PAYMENT).bind(bookingId, SOURCE).first()
        if (!booking) return json({ error: 'Booking not found' }, 404)
        if (booking.payment_status === 'Paid') return json({ error: 'This booking is already paid.' }, 409)
        if (booking.subtotal == null) return json({ error: 'Booking has no price on file.' }, 400)

        // The coupon may have changed since the booking was created.
        const { coupon, total } = applyCoupon(booking.subtotal, couponCode)
        const amount = total * 100
        if (amount < 50) return json({ error: 'Invalid amount' }, 400)
        if (coupon !== booking.coupon || total !== booking.total) {
          await env.DB.prepare(`UPDATE booking_payments SET coupon = ?, total = ? WHERE booking_id = ?`)
            .bind(coupon, total, booking.id).run()
        }

        // Reuse the open PaymentIntent for this booking when the amount hasn't changed.
        if (booking.payment_intent_id) {
          const existing = await stripeRequest(env, `/v1/payment_intents/${booking.payment_intent_id}`, new URLSearchParams(), 'GET')
          if (existing.amount === amount && !['succeeded', 'canceled'].includes(existing.status)) {
            return json({ clientSecret: existing.client_secret, amount: total })
          }
        }

        const customerId = await findOrCreateCustomer(env, booking)
        const params = new URLSearchParams({
          amount: String(amount),
          currency: 'usd',
          'automatic_payment_methods[enabled]': 'true', // required for Link / Apple Pay / Google Pay
          customer: customerId,
          description: `${BUSINESS_NAME}: ${booking.service} on ${booking.date} at ${booking.time}`,
          'metadata[bookingId]': booking.id,
          'metadata[source]': SOURCE
        })
        const details = {
          service: booking.service, date: booking.date, time: `${booking.time} (Pacific)`,
          name: booking.name, phone: booking.phone, email: booking.email,
          address: booking.address, vehicle: booking.vehicle, coupon
        }
        for (const [key, value] of Object.entries(details)) {
          if (value) params.set(`metadata[${key}]`, String(value).slice(0, 500))
        }

        const intent = await stripeRequest(env, '/v1/payment_intents', params)
        await env.DB.prepare(`UPDATE booking_payments SET payment_intent_id = ? WHERE booking_id = ?`)
          .bind(intent.id, booking.id).run()
        return json({ clientSecret: intent.client_secret, amount: total })
      }

      // POST /api/stripe-webhook — optional; marks bookings Paid / Refunded.
      // The Stripe account is shared with other sites, so events for other sources are ignored.
      if (pathname === '/api/stripe-webhook' && request.method === 'POST') {
        const payload = await request.text()
        const valid = await verifyStripeSignature(payload, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET)
        if (!valid) return json({ error: 'Invalid signature' }, 400)

        const event = JSON.parse(payload)
        const obj = event.data?.object || {}

        if (event.type === 'payment_intent.succeeded' && obj.metadata?.source === SOURCE && obj.metadata?.bookingId) {
          await markPaid(env, ctx, obj.metadata.bookingId, obj.id)
        }
        if (event.type === 'charge.refunded' && obj.payment_intent) {
          const status = obj.amount_refunded >= obj.amount ? 'Refunded' : 'Partially Refunded'
          await env.DB.prepare(
            `UPDATE bookings SET payment_status = ?
             WHERE id = (SELECT booking_id FROM booking_payments WHERE payment_intent_id = ?) AND source = ?`
          ).bind(status, obj.payment_intent, SOURCE).run()
        }
        return json({ received: true })
      }

      return json({ error: 'Not found' }, 404)
    } catch (err) {
      console.error(err)
      return json({ error: 'Something went wrong. Please try again.' }, 500)
    }
  }
}
