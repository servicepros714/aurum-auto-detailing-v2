import { Star, Quote } from 'lucide-react'
import '../styles/reviews.css'

const REVIEWS = [
  {
    name: 'Melissa R.',
    vehicle: 'Toyota Sienna',
    text: "Aurum came out to my place in Tustin and the van looks better than when I drove it off the lot. Booked online in two minutes and they showed up right on time.",
  },
  {
    name: 'David C.',
    vehicle: 'Honda CR-V',
    text: 'Premium Detail was worth every dollar. The carpet extraction alone got out stains I thought were permanent. Super professional crew.',
  },
  {
    name: 'Priya N.',
    vehicle: 'Honda Accord',
    text: "I've used two other mobile detailers in OC and Aurum is on a different level. Rims, jambs, everything — spotless.",
  },
  {
    name: 'Jonathan T.',
    vehicle: 'Toyota Corolla',
    text: 'Easy online booking, fair pricing, and they text you when they\'re on the way. My car smells brand new.',
  },
  {
    name: 'Angela M.',
    vehicle: 'Honda Accord',
    text: 'Booked the Basic Detail for my daily driver and added the exterior wash — hand dried with zero water spots. Will be a regular.',
  },
]

export default function Reviews() {
  const loop = [...REVIEWS, ...REVIEWS]

  return (
    <section id="reviews" className="reviews-section section-pad">
      <div className="container reviews-head-wrap">
        <div className="reviews-head reveal">
          <div className="section-eyebrow">Customer Reviews</div>
          <h2 className="section-title">
            Trusted by drivers across <em>Orange County</em>
          </h2>
        </div>
        <div className="reviews-rating reveal reveal-delay-1">
          <div className="reviews-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span>5.0 average from local customers</span>
        </div>
      </div>

      <div className="reviews-marquee-wrap">
        <div className="reviews-marquee">
          {loop.map((r, i) => (
            <article className="review-card" key={i}>
              <Quote size={26} className="review-quote-icon" />
              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p>&ldquo;{r.text}&rdquo;</p>
              <div className="review-author">
                <strong>{r.name}</strong>
                <span>{r.vehicle}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
