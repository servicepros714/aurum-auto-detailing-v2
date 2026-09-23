/**
 * Aurum Auto Detailing — Cloudflare Worker
 * ------------------------------------------------------------
 * Handles booking availability, booking creation, Stripe
 * PaymentIntents, and payment confirmation against a D1 database.
 *
 * Bindings expected (set in the Cloudflare dashboard):
 *   - DB              D1 database binding
 *   - STRIPE_SECRET_KEY   Worker secret (sk_live_... / sk_test_...)
 *
 * Deploy manually via the Cloudflare dashboard (Workers & Pages),
 * per this project's standard workflow — no CLI required.
 */

const SOURCE = 'aurum'
const ID_PREFIX = 'AUR-'
const PREPAY_DISCOUNT = 15 // dollars

// Keep in sync with src/data/services.js
const SERVICE_PRICES = {
  'Basic Detail': 150,
  'Premium Detail': 200,
}
const ADDON_PRICES = {
  'Exterior Wash': 50,
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

function errorResponse(message, status = 400) {
  return json({ error: message }, status)
}

// --- Schema -----------------------------------------------------------

async function ensureSchema(db) {
  const stmt = `
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      service TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      vehicle TEXT,
      address TEXT,
      notes TEXT,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      reschedule_date TEXT,
      reschedule_time TEXT,
      notes2 TEXT,
      original_date TEXT,
      original_time TEXT,
      payment_status TEXT NOT NULL DEFAULT 'Pay Later'
    )
  `.replace(/\s+/g, ' ').trim()

  await db.exec(stmt)
}

// --- Helpers ------------------------------------------------------------

function generateId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  const time = Date.now().toString(36).toUpperCase()
  return `${ID_PREFIX}${time}${rand}`
}

// Parses a "Basic Detail + Exterior Wash" style label back into a dollar
// amount using the server-side price map. Never trusts a client-sent amount.
function computeAmountFromService(serviceLabel) {
  if (!serviceLabel) return 0
  const parts = serviceLabel.split('+').map((p) => p.trim())
  let total = 0
  for (const part of parts) {
    if (SERVICE_PRICES[part] != null) total += SERVICE_PRICES[part]
    else if (ADDON_PRICES[part] != null) total += ADDON_PRICES[part]
  }
  return total
}

async function stripeRequest(env, path, body) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(body)) {
    params.append(key, value)
  }
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Stripe request failed')
  }
  return data
}

// --- Route handlers -------------------------------------------------------

async function handleAvailability(request, env) {
  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  if (!date) return errorResponse('Missing date parameter.')

  await ensureSchema(env.DB)

  const result = await env.DB.prepare(
    `SELECT time FROM bookings WHERE date = ? AND source = ? AND status != 'Cancelled'`
  ).bind(date, SOURCE).all()

  const booked = (result.results || []).map((r) => r.time)
  return json({ date, booked })
}

async function handleCreateBooking(request, env) {
  const body = await request.json().catch(() => null)
  if (!body) return errorResponse('Invalid JSON body.')

  const required = ['date', 'time', 'service', 'name', 'phone', 'email']
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return errorResponse(`Missing required field: ${field}`)
    }
  }

  await ensureSchema(env.DB)

  // Prevent double-booking the same slot for this site.
  const existing = await env.DB.prepare(
    `SELECT id FROM bookings WHERE date = ? AND time = ? AND source = ? AND status != 'Cancelled'`
  ).bind(body.date, body.time, SOURCE).first()

  if (existing) {
    return errorResponse('That time slot was just booked — please choose another.', 409)
  }

  const id = generateId()
  const now = new Date().toISOString()

  await env.DB.prepare(
    `INSERT INTO bookings
      (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    body.date,
    body.time,
    body.service,
    body.name,
    body.phone,
    body.email,
    body.vehicle || '',
    body.address || '',
    body.notes || '',
    SOURCE,
    now,
    'Pending',
    'Pay Later'
  ).run()

  return json({ id, date: body.date, time: body.time, service: body.service, status: 'Pending' }, 201)
}

async function handleCreatePaymentIntent(request, env) {
  const body = await request.json().catch(() => null)
  if (!body?.bookingId) return errorResponse('Missing bookingId.')

  await ensureSchema(env.DB)

  const booking = await env.DB.prepare(
    `SELECT * FROM bookings WHERE id = ? AND source = ?`
  ).bind(body.bookingId, SOURCE).first()

  if (!booking) return errorResponse('Booking not found.', 404)

  let amount = computeAmountFromService(booking.service)
  if (body.coupon && String(body.coupon).toUpperCase() === 'PREPAY') {
    amount = Math.max(0, amount - PREPAY_DISCOUNT)
  }
  if (amount <= 0) return errorResponse('Could not calculate a valid amount.')

  const intent = await stripeRequest(env, 'payment_intents', {
    amount: String(amount * 100), // cents
    currency: 'usd',
    'automatic_payment_methods[enabled]': 'true',
    'metadata[booking_id]': booking.id,
    'metadata[source]': SOURCE,
  })

  return json({ clientSecret: intent.client_secret, amount })
}

async function handleConfirmPayment(request, env) {
  const body = await request.json().catch(() => null)
  if (!body?.bookingId) return errorResponse('Missing bookingId.')

  await ensureSchema(env.DB)

  await env.DB.prepare(
    `UPDATE bookings SET payment_status = 'Paid', status = 'Confirmed' WHERE id = ? AND source = ?`
  ).bind(body.bookingId, SOURCE).run()

  return json({ ok: true })
}

async function handleCoupon(request) {
  const url = new URL(request.url)
  const code = (url.searchParams.get('code') || '').toUpperCase()
  const valid = code === 'PREPAY'
  return json({ valid, discount: valid ? PREPAY_DISCOUNT : 0 })
}

// Admin-dashboard compatible reschedule/patch endpoint.
async function handlePatchBooking(request, env, id) {
  const body = await request.json().catch(() => null)
  if (!body) return errorResponse('Invalid JSON body.')

  await ensureSchema(env.DB)

  const PATCHABLE = ['reschedule_date', 'reschedule_time', 'original_date', 'original_time', 'notes2', 'status', 'payment_status', 'date', 'time']
  const sets = []
  const values = []
  for (const key of PATCHABLE) {
    if (body[key] !== undefined) {
      sets.push(`${key} = ?`)
      values.push(body[key])
    }
  }
  if (!sets.length) return errorResponse('No patchable fields provided.')

  values.push(id, SOURCE)
  await env.DB.prepare(
    `UPDATE bookings SET ${sets.join(', ')} WHERE id = ? AND source = ?`
  ).bind(...values).run()

  return json({ ok: true })
}

// --- Router ---------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const { pathname } = url

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    try {
      if (pathname === '/api/availability' && request.method === 'GET') {
        return await handleAvailability(request, env)
      }
      if (pathname === '/api/bookings' && request.method === 'POST') {
        return await handleCreateBooking(request, env)
      }
      if (pathname === '/api/create-payment-intent' && request.method === 'POST') {
        return await handleCreatePaymentIntent(request, env)
      }
      if (pathname === '/api/confirm-payment' && request.method === 'POST') {
        return await handleConfirmPayment(request, env)
      }
      if (pathname === '/api/coupon' && request.method === 'GET') {
        return await handleCoupon(request)
      }
      const patchMatch = pathname.match(/^\/api\/bookings\/([^/]+)$/)
      if (patchMatch && request.method === 'PATCH') {
        return await handlePatchBooking(request, env, patchMatch[1])
      }

      return errorResponse('Not found.', 404)
    } catch (err) {
      return errorResponse(err.message || 'Internal error.', 500)
    }
  },
}
