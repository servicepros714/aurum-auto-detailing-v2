// Business facts used across the site, the schema and the prerendered pages.
// Confirmed facts (owner, Nov 2026): mobile only, we bring our own water and power,
// same price for every vehicle size, satisfaction guarantee, every day 8 AM - 5 PM,
// Basic Detail usually 1.5-2 hours and Premium Detail 3-4 hours, prepay online with
// code PREPAY for $15 off. Same prices and hours in the nearby cities.
// NOT confirmed, so never claimed: ratings, insurance, years in business, vehicle counts,
// product brands or formulas, ceramic coating or paint work (not offered).

// Canonical domain (no www; www redirects to it). aurumautodetailing.COM is another business.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://aurumautodetailing.site').replace(/\/$/, '')

export const BUSINESS = {
  name: 'Aurum Auto Detailing',
  short: 'Aurum',
  city: 'Tustin',
  phone: '(714) 942-4780',
  phoneHref: 'tel:+17149424780',
  phoneSchema: '+1-714-942-4780',
  hours: 'Every day, 8 AM – 5 PM',
  areas: ['Old Town Tustin', 'Tustin Ranch', 'Tustin Legacy', 'Columbus Square', 'Tustin Meadows', 'Red Hill'],
}

// Google Business Profile. Used in the schema (sameAs) once known. Leave '' until then.
export const GOOGLE_PROFILE_URL = ''

// Real Google reviews only. The Reviews section and its menu link stay hidden while
// this list is empty. Add each one as { name: 'First L.', text: '...' } (first name +
// last initial, typos fixed). Leave out reviews that read like a shop visit.
export const REVIEWS = []

// Home page FAQ. Shown on the page and used for the FAQPage schema, so keep both in sync.
export const FAQS = [
  { q: 'Do you come to me in Tustin?', a: 'Yes. Aurum is mobile only. We detail your car at your home or workplace in Tustin, wherever it is parked.' },
  { q: 'Do you need my water or power?', a: 'No. We bring our own water and power, so there is nothing for you to hook up.' },
  { q: 'What does a detail cost?', a: 'The Basic Detail is $150 and the Premium Detail is $200. The Exterior Wash adds $50 to either one.' },
  { q: 'Does an SUV or truck cost more?', a: 'No. Cars, SUVs, trucks and minivans all pay the same price.' },
  { q: 'How long does a detail take?', a: 'A Basic Detail usually takes 1.5–2 hours and a Premium Detail 3–4 hours, depending on the condition of the car.' },
  { q: 'Can I book only the exterior wash?', a: 'No. The Exterior Wash is a $50 add-on to the Basic or Premium Detail, so every visit includes an interior detail.' },
  { q: 'Which days and times can I book?', a: 'Every day of the week, with start times from 8 AM to 5 PM. Pick your time when you book online.' },
  { q: 'Do I have to pay online?', a: 'No. Pay online at checkout and take $15 off with code PREPAY, or choose to pay at your appointment.' },
  { q: 'What if I am not happy with the result?', a: 'Tell us. Every detail is backed by our satisfaction guarantee, and we will make it right.' },
]
