// Thin client around the Aurum Auto Detailing Cloudflare Worker (worker/worker.js).
// All booking + payment state lives in D1 behind this API. Prices are computed by
// the Worker from serviceId / exteriorAddOn / coupon, never taken from the browser.

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  let data = null
  try {
    data = await res.json()
  } catch (_) {
    // no-op — some responses may not be JSON
  }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

// { date, booked: ["8:00 AM", ...] } — booked or no-longer-bookable start times.
export function getAvailability(date) {
  return request(`/api/availability?date=${encodeURIComponent(date)}`)
}

// { date, time, serviceId, exteriorAddOn, name, phone, email, vehicle, address }
// -> { id, status, service, subtotal, coupon, total }
export function createBooking(payload) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// { bookingId, coupon } -> { clientSecret, amount }
export function createPaymentIntent(payload) {
  return request('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// After the card form succeeds. The Worker checks the PaymentIntent with Stripe
// before marking the booking Paid and sending the confirmation email.
export function markPaid(bookingId, paymentIntentId) {
  return request(`/api/bookings/${encodeURIComponent(bookingId)}/paid`, {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId }),
  })
}

// Customer chose to pay at the appointment. Confirms the booking and sends the email.
export function confirmPayLater(bookingId, email) {
  return request(`/api/bookings/${encodeURIComponent(bookingId)}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

// { valid, discount } — currently just PREPAY for the $15 prepay offer.
export function validateCoupon(code) {
  return request('/api/validate-coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
