import { Link } from 'react-router-dom'
import { Check, ArrowUpRight } from 'lucide-react'
import { SERVICES, ADD_ONS } from '../data/services'
import { ServiceChips } from './ServiceLinks'
import '../styles/services.css'

const CARDS = [...SERVICES, ...ADD_ONS]

// Package cards. The home page shows links to the service pages under the cards;
// landing pages reuse the section with their own heading and no links.
export default function Services({
  eyebrow = 'What We Offer',
  title = <>Mobile detailing packages for <em>Tustin driveways</em></>,
  showLinks = true,
}) {
  return (
    <section id="services" className="services-section section-pad">
      <div className="container">
        <div className="services-head reveal">
          <div>
            <div className="section-eyebrow">{eyebrow}</div>
            <h2 className="section-title">{title}</h2>
          </div>
          <p className="section-sub">
            Every visit is a mobile appointment. We bring our own water and power,
            and the price is the same for a compact car or a three-row SUV.
          </p>
        </div>

        <div className="services-scroll">
          {CARDS.map((card, i) => (
            <article
              className={`service-card reveal reveal-delay-${Math.min(i + 1, 4)} ${card.popular ? 'is-popular' : ''}`}
              key={card.id}
            >
              {card.popular && <div className="service-card-badge">Most Popular</div>}
              <div className="service-card-num">0{i + 1}</div>
              <h3>{card.name}</h3>
              <p className="service-card-tagline">{card.tagline}</p>
              <div className="service-card-price">
                <span>{card.id === 'exterior' ? '+' : ''}${card.price}</span>
                <small>{card.id === 'exterior' ? 'add-on to either detail' : `about ${card.duration}`}</small>
              </div>
              <ul className="service-card-features">
                {card.features.map((f) => (
                  <li key={f}>
                    <Check size={15} strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {showLinks && (
          <div className="services-links reveal">
            <span>Compare in detail:</span>
            <ServiceChips />
          </div>
        )}

        <div className="services-cta-wrap reveal">
          <Link to="/book" className="btn btn-primary btn-lg">
            Book Now <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}