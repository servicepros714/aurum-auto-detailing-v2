// ---------------------------------------------------------------------------
// SEO landing pages. One template renders all of them (src/pages/Landing.jsx);
// head tags and schema come from src/lib/seo.js.
//
// Home targets "Mobile Car Detailing Tustin". Tustin, Irvine, Santa Ana and Orange
// already have /mobile-car-detailing-<city> pages on same-owner sites (Refined,
// Imperial, Premier, Hyper Coat, Phantom, Vetra...) and Torque uses
// /mobile-auto-detailing-irvine, so these slugs use other wording ("mobile
// detailing", interior cleaning, shampoo & extraction, wash & detail, packages)
// and the copy is unique. The owner is fine with city overlap.
//
// Facts: prices and package contents in src/data/services.js, the confirmed list
// in src/data/business.js. Same prices and hours in every city. The Exterior Wash
// is never sold on its own.
// ---------------------------------------------------------------------------

const BRANDS = ['Aurum Auto Detailing', 'Aurum Detailing', 'Aurum'];

// Longest title that fits in 60 chars (counting '&' as the escaped '&amp;').
// Keep ", CA" before the long brand name, then drop ", CA" if nothing fits.
export function fitTitle(keyword, city) {
  const options = [
    ...BRANDS.map((b) => `${keyword} ${city}, CA | ${b}`),
    ...BRANDS.map((b) => `${keyword} ${city} | ${b}`),
  ]
  const len = (t) => t.replace(/&/g, '&amp;').length
  return options.find((t) => len(t) <= 60) || options[options.length - 1]
}

export const HOME_CITY = 'Tustin'

// Schema offers: only what a customer can book. The wash never appears alone.
const DETAIL_OFFERS = [
  ['Basic Detail', 150],
  ['Premium Detail', 200],
  ['Basic Detail + Exterior Wash', 200],
  ['Premium Detail + Exterior Wash', 250],
]
const PREMIUM_OFFERS = [
  ['Premium Detail', 200],
  ['Premium Detail + Exterior Wash', 250],
]
const WASH_OFFERS = [
  ['Basic Detail + Exterior Wash', 200],
  ['Premium Detail + Exterior Wash', 250],
]

// Real Aurum photos (all exterior washes at the customer's curb or driveway).
const PHOTO = {
  sienna: { src: '/images/gallery-2.jpg', alt: 'Red Toyota Sienna minivan after a mobile hand wash in a driveway', w: 1080, h: 1070 },
  siennaFoam: { src: '/images/gallery-1.jpg', alt: 'Toyota Sienna covered in wash foam during a mobile detail', w: 1080, h: 1062 },
  crv: { src: '/images/gallery-3.jpg', alt: 'Honda SUV covered in foam during a curbside mobile wash', w: 1080, h: 1072 },
  accord: { src: '/images/gallery-4.jpg', alt: 'Gray Honda Accord after a mobile hand wash and dry', w: 1080, h: 1077 },
  rinse: { src: '/images/gallery-5.jpg', alt: 'Aurum Auto Detailing rinsing a foamed Honda Accord at the curb', w: 1080, h: 1081 },
  corolla: { src: '/images/gallery-6.jpg', alt: 'Blue Toyota Corolla foamed down on a mobile detailing visit', w: 1080, h: 1075 },
}

const FAQ_SIZE = { q: 'Does an SUV or truck cost more?', a: 'No. Cars, SUVs, trucks and minivans all pay the same price.' }
const FAQ_WATER = { q: 'Do you need my water or an outlet?', a: 'No. We bring our own water and power.' }
const FAQ_WASH = { q: 'Can I book only the exterior wash?', a: 'No. The Exterior Wash is a $50 add-on to the Basic or Premium Detail.' }
const FAQ_GUARANTEE = { q: 'What if something is missed?', a: 'Tell us. Every detail is backed by our satisfaction guarantee, and we will make it right.' }
const FAQ_PAY = { q: 'Do I have to pay when I book?', a: 'No. Pay at the appointment, or pay online at checkout with code PREPAY for $15 off.' }
const FAQ_TIME = { q: 'How long does it take?', a: 'A Basic Detail usually takes 1.5 to 2 hours and a Premium Detail 3 to 4 hours, depending on the car.' }

export const SERVICE_PAGES = [
  {
    path: '/car-interior-cleaning-tustin',
    nav: 'Interior cleaning',
    city: HOME_CITY,
    title: fitTitle('Car Interior Cleaning', HOME_CITY),
    description: 'Car interior cleaning in Tustin, CA. Basic Detail $150 or Premium Detail $200 with shampoo and extraction. Mobile, every day 8 AM to 5 PM. Book online.',
    eyebrow: 'Interior cleaning · Tustin, CA',
    h1: ['Car interior cleaning', 'in Tustin.'],
    lede: 'Crumbs in the seat seams, dust in the vents and floor mats that never quite come clean. We clean the cabin surface by surface, right where the car is parked.',
    facts: ['From $150', 'Own water & power', 'Every day 8–5'],
    card: 'premium',
    pkg: 'basic',
    photo: PHOTO.accord,
    intro: {
      h2: 'Two levels of interior clean.',
      paras: [
        'Both details start with triple-stage vacuuming: three passes that pull out the grit a quick vacuum leaves in carpet, under the seats and around the seat rails.',
        'The $150 Basic Detail then wipes down every interior surface and cleans and restores the floor mats. It usually takes 1.5 to 2 hours and suits a car that is lived in but not stained.',
        'The $200 Premium Detail takes 3 to 4 hours and adds dust elimination, interior windows, deep carpet cleaning, cloth and carpet extraction, full interior shampooing and a UV-protectant coating.',
      ],
    },
    pointsTitle: 'Why Tustin drivers book an Aurum interior',
    points: [
      { title: 'Three vacuum passes', text: 'Triple-stage vacuuming is part of both details.' },
      { title: 'Nothing to set up', text: 'We bring our own water and power to your driveway or parking spot.' },
      { title: 'Satisfaction guarantee', text: 'If something is not right, tell us and we will make it right.' },
    ],
    faqs: [
      { q: 'Which detail should I pick?', a: 'The Basic Detail for a lived-in car without stains. The Premium Detail when seats or carpets need shampoo and extraction.' },
      FAQ_TIME,
      FAQ_SIZE,
      FAQ_WATER,
      FAQ_PAY,
    ],
    service: { type: 'Car interior cleaning', offers: DETAIL_OFFERS },
  },
  {
    path: '/car-shampoo-extraction-tustin',
    nav: 'Shampoo & extraction',
    city: HOME_CITY,
    title: fitTitle('Car Shampoo & Extraction', HOME_CITY),
    description: 'Car seat and carpet shampoo with extraction in Tustin, CA. Part of the $200 Premium Detail, done at your home or work. Same price for any vehicle.',
    eyebrow: 'Shampoo & extraction · Tustin, CA',
    h1: ['Car shampoo & extraction', 'in Tustin.'],
    lede: 'Coffee, juice boxes and muddy shoes soak into cloth seats and carpet. Shampoo with extraction lifts that dirt back out instead of pushing it deeper.',
    facts: ['$200 Premium Detail', 'Any vehicle size', 'Every day 8–5'],
    card: 'premium',
    pkg: 'premium',
    photo: PHOTO.siennaFoam,
    intro: {
      h2: 'How the shampoo works.',
      paras: [
        'Shampoo and extraction come with the Premium Detail. We start with triple-stage vacuuming so loose dirt is gone before any water touches the fabric.',
        'Then cloth seats and carpets are shampooed and extracted, which rinses the fabric and pulls the dirty water back out. Deep carpet cleaning, interior windows, dust elimination and a UV-protectant coating finish the cabin.',
        'Most everyday spills and dirt come out. Old set-in stains, ink or dye transfer may lighten rather than disappear.',
      ],
    },
    pointsTitle: 'What to know before you book',
    points: [
      { title: 'One price', text: '$200 for a compact or a three-row SUV.' },
      { title: '3 to 4 hours', text: 'The usual time for a Premium Detail, depending on the car.' },
      { title: 'Add the outside', text: 'The $50 Exterior Wash makes it $250 inside and out.' },
    ],
    faqs: [
      { q: 'Is shampoo part of the Basic Detail?', a: 'No. Shampoo and extraction come with the Premium Detail ($200). The Basic Detail is vacuuming, a full wipe-down and floor mats.' },
      { q: 'Will every stain come out?', a: 'Most everyday stains do. Old set-in stains, ink or dye transfer may only lighten.' },
      FAQ_PAY,
      FAQ_SIZE,
      FAQ_GUARANTEE,
    ],
    service: { type: 'Car upholstery and carpet shampoo', offers: PREMIUM_OFFERS },
  },
  {
    path: '/car-wash-and-detail-tustin',
    nav: 'Wash & detail',
    city: HOME_CITY,
    title: fitTitle('Car Wash & Detail', HOME_CITY),
    description: 'Car wash and detail in Tustin, CA: an interior detail plus a $50 exterior hand wash, from $200. We come to you with our own water and power.',
    eyebrow: 'Inside & out · Tustin, CA',
    h1: ['Car wash & detail', 'in Tustin.'],
    lede: 'Get the inside and the outside done in one visit. Pick an interior detail, add the Exterior Wash, and we handle both at your curb or in your driveway.',
    facts: ['From $200', 'Hand wash & dry', 'Own water & power'],
    card: 'combo',
    pkg: 'premium',
    photo: PHOTO.sienna,
    intro: {
      h2: 'An interior detail, then the wash.',
      paras: [
        'The Exterior Wash is an add-on, so every visit starts with the Basic Detail ($150) or the Premium Detail ($200) inside the car.',
        'For $50 more we hand wash the outside, clean the rims in detail, scrub and degrease the tires, wipe down the door jambs and panels, apply tire shine and hand dry the paint to avoid water spots.',
        'That is $200 with the Basic Detail or $250 with the Premium Detail. We bring our own water and power, so all you need is a spot where we can reach the car.',
      ],
    },
    pointsTitle: 'Inside and out in one stop',
    points: [
      { title: 'Hand washed', text: 'A hand wash, detailed rims and a spot-free hand dry.' },
      { title: 'At your address', text: 'Driveway, street or work parking lot in Tustin.' },
      { title: '$15 off online', text: 'Use code PREPAY at checkout, or pay at the appointment.' },
    ],
    faqs: [
      { q: 'How much is a wash and detail?', a: '$200 for the Basic Detail with the Exterior Wash, or $250 for the Premium Detail with the Exterior Wash.' },
      FAQ_WASH,
      FAQ_WATER,
      { q: 'Can you wash the car on the street?', a: 'Yes, as long as we can safely reach all sides of the car.' },
      FAQ_PAY,
    ],
    service: { type: 'Hand car wash and interior detail', offers: WASH_OFFERS },
  },
  {
    path: '/detailing-packages-tustin',
    nav: 'Packages & prices',
    city: HOME_CITY,
    title: fitTitle('Auto Detailing Packages', HOME_CITY),
    description: 'Auto detailing packages in Tustin, CA: Basic Detail $150, Premium Detail $200, Exterior Wash add-on $50. Same price for any vehicle. Book online.',
    eyebrow: 'Packages · Tustin, CA',
    h1: ['Auto detailing packages', 'in Tustin.'],
    lede: 'Two details, one add-on, and the price stays the same whatever you drive. Here is what each package costs, covers and how long it takes.',
    facts: ['Basic $150', 'Premium $200', 'Wash add-on $50'],
    card: 'premium',
    pkg: 'premium',
    photo: PHOTO.rinse,
    intro: {
      h2: 'What each package includes.',
      paras: [
        'Basic Detail, $150, usually 1.5 to 2 hours: triple-stage vacuuming for deep debris, a complete wipe-down of the interior surfaces, and floor mats cleaned and restored.',
        'Premium Detail, $200, usually 3 to 4 hours: everything in the vacuuming plus cabin application, dust elimination, interior windows, deep carpet cleaning, cloth and carpet extraction, full interior shampooing and a UV-protectant coating.',
        'Exterior Wash, +$50 on either detail: hand wash, detailed rims, tire scrub and degrease, door jambs and panels, tire shine and a spot-free hand dry. Code PREPAY takes $15 off when you pay online.',
      ],
    },
    pointsTitle: 'Simple pricing',
    points: [
      { title: 'Same price any vehicle', text: 'A sedan and a minivan pay the same.' },
      { title: 'Visit included', text: 'The price includes coming to your Tustin address.' },
      { title: 'Pay now or later', text: 'Prepay online for $15 off, or pay at the appointment.' },
    ],
    faqs: [
      { q: 'What does the most complete visit cost?', a: '$250: the Premium Detail with the Exterior Wash.' },
      FAQ_SIZE,
      FAQ_TIME,
      FAQ_WASH,
      FAQ_GUARANTEE,
    ],
    service: { type: 'Auto detailing', offers: DETAIL_OFFERS },
  },
]

// City pages: same packages, prices and hours; local wording.
function cityPage({ slug, city, areas, lede, paras, photo, faq }) {
  return {
    path: `/mobile-detailing-${slug}`,
    nav: city,
    city,
    isCity: true,
    title: fitTitle('Mobile Detailing', city),
    description: `Mobile detailing in ${city}, CA by Aurum Auto Detailing. Details $150 and $200, $50 exterior wash add-on, same price any car. Every day 8 AM to 5 PM.`,
    eyebrow: `Mobile detailing · ${city}, CA`,
    h1: ['Mobile detailing', `in ${city}.`],
    lede,
    facts: ['From $150', 'Own water & power', 'Every day 8–5'],
    card: 'combo',
    pkg: 'premium',
    photo,
    areas,
    intro: { h2: `We come to you in ${city}.`, paras },
    pointsTitle: `Why ${city} drivers book Aurum`,
    points: [
      { title: 'Tustin prices', text: 'The same $150 and $200 details and $50 wash add-on, for any vehicle.' },
      { title: 'Self-contained', text: 'We bring our own water and power, so there is nothing to hook up.' },
      { title: 'Satisfaction guarantee', text: 'If something is not right, tell us and we will make it right.' },
    ],
    faqs: [
      { q: `Do you come to ${city}?`, a: `Yes. We detail cars at homes and workplaces across ${city}, including ${areas.slice(0, 3).join(', ')}.` },
      faq,
      FAQ_SIZE,
      FAQ_WATER,
      FAQ_WASH,
    ],
    service: { type: 'Mobile auto detailing', offers: DETAIL_OFFERS },
  }
}

export const CITY_PAGES = [
  cityPage({
    slug: 'santa-ana',
    city: 'Santa Ana',
    areas: ['Floral Park', 'Downtown Santa Ana', 'South Coast Metro', 'Morrison Park', 'Park Santiago'],
    lede: 'Santa Ana shares a border with Tustin, and it gets the same mobile service: we drive to your address and detail the car where it sits.',
    paras: [
      'We work across Santa Ana, from the older streets of Floral Park, Park Santiago and Morrison Park to downtown and the offices around South Coast Metro.',
      'Pick the $150 Basic Detail for three vacuum passes, a full wipe-down and clean floor mats, or the $200 Premium Detail when seats and carpets need shampoo and extraction.',
      'Add the $50 Exterior Wash for a hand wash and spot-free dry. Start times run every day from 8 AM to 5 PM.',
    ],
    photo: PHOTO.corolla,
    faq: { q: 'Can you detail my car at work in Santa Ana?', a: 'Yes. Enter the work address when you book; we only need room around the car to open the doors.' },
  }),
  cityPage({
    slug: 'irvine',
    city: 'Irvine',
    areas: ['Woodbridge', 'Northwood', 'University Park', 'Turtle Rock', 'Great Park'],
    lede: 'Irvine starts just south of Tustin. Book a detail for your home, apartment or office lot and we bring everything with us.',
    paras: [
      'We detail cars in Irvine villages from Northwood and Woodbridge to University Park, Turtle Rock and the newer neighborhoods around the Great Park.',
      'The Basic Detail ($150, usually 1.5 to 2 hours) covers vacuuming, a full wipe-down and floor mats. The Premium Detail ($200, usually 3 to 4 hours) adds deep carpet cleaning, extraction, shampoo and UV protection.',
      'There is no extra charge for an SUV, truck or minivan, and code PREPAY takes $15 off when you pay online.',
    ],
    photo: PHOTO.crv,
    faq: { q: 'Can you work in my apartment or HOA parking?', a: 'We bring our own water and power, so we only need access to the car. Check any building or HOA rules on car washing first.' },
  }),
  cityPage({
    slug: 'orange',
    city: 'Orange',
    areas: ['Old Towne Orange', 'El Modena', 'Orange Park Acres', 'Santiago Hills', 'Serrano Heights'],
    lede: 'Orange sits right on Tustin’s northern edge. We bring the same interior details, and the hand wash if you want it, to your driveway there.',
    paras: [
      'We come to homes and workplaces across the City of Orange, from the streets around Old Towne and El Modena to Orange Park Acres, Santiago Hills and Serrano Heights.',
      'Book the $150 Basic Detail or the $200 Premium Detail, which adds full shampoo and cloth and carpet extraction to the interior.',
      'Want the outside done too? The $50 Exterior Wash adds a hand wash, detailed rims, tire shine and a spot-free hand dry.',
    ],
    photo: PHOTO.accord,
    faq: { q: 'How much is inside and out in Orange?', a: '$250 for the Premium Detail with the Exterior Wash, or $200 for the Basic Detail with the Exterior Wash.' },
  }),
  cityPage({
    slug: 'north-tustin',
    city: 'North Tustin',
    areas: ['Lemon Heights', 'Cowan Heights', 'Panorama Heights', 'Foothill Boulevard', 'Peters Canyon'],
    lede: 'North Tustin wraps around the hills above Tustin. We bring the same details there and work on the car right at your home.',
    paras: [
      'We detail cars throughout unincorporated North Tustin, including Lemon Heights, Cowan Heights and Panorama Heights, the homes along Foothill Boulevard and the streets near Peters Canyon.',
      'Choose the $150 Basic Detail or the $200 Premium Detail with deep carpet cleaning, extraction, full shampoo and a UV-protectant coating.',
      'Add the $50 Exterior Wash for the outside. Pay online with code PREPAY for $15 off, or pay at the appointment.',
    ],
    photo: PHOTO.sienna,
    faq: { q: 'Is North Tustin the same price as Tustin?', a: 'Yes. Same packages, same prices and the same hours, every day from 8 AM to 5 PM.' },
  }),
]

export const LANDING_PAGES = [...SERVICE_PAGES, ...CITY_PAGES]

export function findLanding(path) {
  return LANDING_PAGES.find((p) => p.path === path)
}
