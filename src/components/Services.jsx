import { Link } from 'react-router-dom'
import { Check, ArrowUpRight } from 'lucide-react'
import { SERVICES, ADD_ONS } from '../data/services'
import '../styles/services.css'

const CARDS = [...SERVICES, ...ADD_ONS]

export default function Services() {
  return (
    <section id="services" className="services-section section-pad">
      <div className="container">
        <div className="services-head reveal">
          <div>
            <div className="section-eyebrow">What We Offer</div>
            <h2 className="section-title">
              Detailing packages built for <em>real Orange County driveways</em>
            </h2>
          </div>
          <p className="section-sub">
            Every visit is a mobile appointment — our team arrives with water,
            power, and everything needed to bring the shine to you.
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
                {card.id !== 'exterior' && <small>starting at</small>}
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

        <div className="services-cta-wrap reveal">
          <Link to="/book" className="btn btn-primary btn-lg">
            Book Now <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}