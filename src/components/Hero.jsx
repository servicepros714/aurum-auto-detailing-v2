import { Link } from 'react-router-dom'
import { ShieldCheck, Clock, MapPin, ArrowRight } from 'lucide-react'
import { BUSINESS } from '../data/business'
import '../styles/hero.css'

const STATS = [
  { value: '8–5', label: 'Open Every Day', icon: Clock },
  { value: '100%', label: 'Satisfaction Guaranteed', icon: ShieldCheck },
  { value: 'Tustin', label: 'We Come To You', icon: MapPin },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-left-content">
          <h1 className="section-eyebrow">Mobile Car Detailing in Tustin, CA</h1>
          <p className="hero-title">
            Showroom shine, <span className="chrome-text">delivered</span> to your <em>driveway</em>.
          </p>
          <p className="hero-sub">
            Aurum Auto Detailing brings interior detailing, plus an optional
            exterior hand wash, to your home or office in Tustin and nearby
            cities. We bring our own water and power, so there is no drop-off
            and nothing to set up.
          </p>
          <div className="hero-cta-row">
            <Link to="/book" className="btn btn-primary btn-lg">
              Book Your Detail <ArrowRight size={17} />
            </Link>
            <a href={BUSINESS.phoneHref} className="btn btn-outline btn-lg">
              {BUSINESS.phone}
            </a>
          </div>
          <div className="hero-tags">
            <span>Basic Detail $150</span>
            <span className="hero-tag-divider" />
            <span>Premium Detail $200</span>
            <span className="hero-tag-divider" />
            <span>+ Exterior Wash $50</span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-image-wrap">
          <img src="/images/gallery-2.jpg" alt="Freshly detailed Toyota exterior, hand-washed to a mirror shine" />
          <div className="hero-image-shade" />
        </div>
        <div className="hero-stripe" aria-hidden="true" />
      </div>

      <div className="hero-stats">
        <div className="container hero-stats-inner">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div className="hero-stat-card" key={label}>
              <Icon size={20} strokeWidth={2.2} />
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
