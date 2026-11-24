import { Star, Quote } from 'lucide-react'
import { REVIEWS } from '../data/business'
import '../styles/reviews.css'

// Real Google reviews only, from src/data/business.js. Hidden while the list is empty.

export default function Reviews() {
  if (!REVIEWS.length) return null
  const loop = [...REVIEWS, ...REVIEWS]

  return (
    <section id="reviews" className="reviews-section section-pad">
      <div className="container reviews-head-wrap">
        <div className="reviews-head reveal">
          <div className="section-eyebrow">Customer Reviews</div>
          <h2 className="section-title">
            What customers <em>say</em>
          </h2>
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
                <span>Google review</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
