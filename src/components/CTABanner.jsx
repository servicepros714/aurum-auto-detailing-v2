import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import { BUSINESS } from '../data/business'
import '../styles/cta-banner.css'

export default function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="cta-banner-pattern" aria-hidden="true" />
      <div className="container cta-banner-inner reveal">
        <h2>
          Ready for a car that turns heads <em>again</em>?
        </h2>
        <p>Pick your service, choose a time that works, and we'll handle the rest — right in your driveway.</p>
        <div className="cta-banner-actions">
          <Link to="/book" className="btn btn-chrome btn-lg">
            Book Online <ArrowRight size={17} />
          </Link>
          <a href={BUSINESS.phoneHref} className="btn btn-outline btn-lg">
            <Phone size={16} /> {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
