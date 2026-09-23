import { Link } from 'react-router-dom'
import { ShieldCheck, Star, MapPin, ArrowRight } from 'lucide-react'
import '../styles/hero.css'

const STATS = [
  { value: '5.0', label: 'Average Rating', icon: Star },
  { value: '100%', label: 'Satisfaction Guaranteed', icon: ShieldCheck },
  { value: 'OC', label: 'We Come To You', icon: MapPin },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-left-content">
          <div className="section-eyebrow">Mobile Detailing · Tustin, CA</div>
          <h1 className="hero-title">
            Showroom shine, <span className="chrome-text">delivered</span> to your <em>driveway</em>.
          </h1>
          <p className="hero-sub">
            Aurum Auto Detailing brings professional-grade interior and exterior
            detailing straight to your home or office across Orange County — no
            drop-off, no waiting room, just a car that looks brand new.
          </p>
          <div className="hero-cta-row">
            <Link to="/book" className="btn btn-primary btn-lg">
              Book Your Detail <ArrowRight size={17} />
            </Link>
            <a href="tel:+17149424780" className="btn btn-outline btn-lg">
              (714) 942-4780
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
