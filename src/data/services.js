// Shared service catalog. Prices are in whole US dollars.
// IMPORTANT: this list must stay in sync with worker/index.js SERVICES map —
// the Worker recalculates the total server-side before creating the
// Stripe PaymentIntent so the browser can never spoof the amount.

export const SERVICES = [
  {
    id: 'basic',
    name: 'Basic Detail',
    price: 150,
    tagline: 'Deep interior refresh',
    description:
      'A thorough interior refresh that clears out debris, wipes every surface, and restores your floor mats — the essential detail for a car that sees daily life.',
    features: [
      'Triple-Stage Vacuuming for Deep Debris Removal',
      'Complete Interior Surface Wipe-Down',
      'Floor Mat Cleaning & Restoration',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Detail',
    price: 200,
    tagline: 'Full interior transformation',
    popular: true,
    description:
      'Our most complete interior service — full shampoo extraction, UV-protectant coating, and a cabin-fresh finish that makes the cabin feel brand new.',
    features: [
      'Triple-Stage Vacuuming',
      'Cabin Application',
      'Dust Elimination',
      'Interior Window Cleaning',
      'Deep Carpet Cleaning',
      'Cloth & Carpet Extraction',
      'Full Interior Shampooing',
      'UV-Protectant Coating',
    ],
  },
]

export const ADD_ONS = [
  {
    id: 'exterior',
    name: 'Exterior Wash',
    price: 50,
    tagline: 'Hand-washed shine, inside and out',
    description:
      'Pair any interior detail with a full hand-wash exterior finish — rims, tires, jambs, and a spot-free dry.',
    features: [
      'Hand-Washed Exterior',
      'Detailed Rim Cleaning',
      'Tire Scrub and Degrease',
      'Door Jamb & Panel Wipe-Down',
      'Premium Tire Shine Application',
      'Spot-Free Hand Drying',
    ],
  },
]

export function findService(id) {
  return SERVICES.find((s) => s.id === id) || null
}

export function findAddOn(id) {
  return ADD_ONS.find((a) => a.id === id) || null
}

// Builds { label, total } from a service id + whether the exterior add-on is included.
export function buildOrder(serviceId, hasExterior) {
  const service = findService(serviceId)
  if (!service) return null
  const addOn = hasExterior ? findAddOn('exterior') : null
  const total = service.price + (addOn ? addOn.price : 0)
  const label = addOn ? `${service.name} + ${addOn.name}` : service.name
  return { service, addOn, total, label }
}
