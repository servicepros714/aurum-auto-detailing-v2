// Thin client around the Aurum Detailing Cloudflare Worker.
// All booking + payment state lives in D1 behind this API —
// nothing is stored in localStorage.

const API_URL = import.meta.env.VITE_API_URL || ''

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

// Returns the list of already-booked time slots for a given date.
export function getAvailability(date) {
  return request(`/api/availability?date=${encodeURIComponent(date)}`)
}

// Creates a booking row in D1. Returns { id, ...booking }.
export function createBooking(payload) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Creates a Stripe PaymentIntent for a booking. The Worker recalculates
// the amount server-side from the service string — the client amount is
// never trusted directly. Returns { clientSecret, amount }.
export function createPaymentIntent(payload) {
  return request('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Marks a booking as paid after Stripe confirms the PaymentIntent.
export function confirmPayment(payload) {
  return request('/api/confirm-payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Validates a coupon code (currently just PREPAY for the $15 prepay offer).
export function validateCoupon(code) {
  return request(`/api/coupon?code=${encodeURIComponent(code)}`)
}
