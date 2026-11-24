// Small helpers shared by the checkout and confirmation pages.

// "2026-12-03" -> "Thursday, December 3" (parsed as a calendar date, no timezone shift).
export function formatBookingDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || ''
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// The checkout details, kept for this tab only, so a payment method that leaves the
// site (and returns to /confirmation?payment_intent=...) can still be confirmed.
const KEY = 'aurum-checkout'

export function saveCheckout(data) {
  try {
    if (data) sessionStorage.setItem(KEY, JSON.stringify(data))
    else sessionStorage.removeItem(KEY)
  } catch (_) {
    // storage blocked: only the redirect fallback is lost
  }
}

export function loadCheckout() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch (_) {
    return null
  }
}
