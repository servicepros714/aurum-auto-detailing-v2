import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock } from 'lucide-react'
import { BUSINESS, REVIEWS } from '../data/business'
import { SERVICE_PAGES, CITY_PAGES, HOME_CITY } from '../lib/pages'
import '../styles/footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-watermark" aria-hidden="true">AURUM</div>
      <div className="container footer-inner">
        <div className="footer-top">
          <div className="footer-col footer-brand">
            <img src="/images/logo.png" alt="Aurum Auto Detailing" className="footer-logo" />
            <p>
              Mobile car detailing based in Tustin, CA. We bring our own water
              and power to your home or office.
            </p>
          </div>

          <div className="footer-col">
            <h4>Navigate</h4>
            <ul>
              <li><a href="/#services">Services</a></li>
              <li><a href="/#about">About</a></li>
              <li><a href="/#gallery">Gallery</a></li>
              {REVIEWS.length > 0 && <li><a href="/#reviews">Reviews</a></li>}
              <li><a href="/#faq">FAQ</a></li>
              <li><Link to="/book">Book Online</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              {SERVICE_PAGES.map((p) => (
                <li key={p.path}><Link to={p.path}>{p.nav}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Areas</h4>
            <ul>
              <li><Link to="/">{HOME_CITY}</Link></li>
              {CITY_PAGES.map((p) => (
                <li key={p.path}><Link to={p.path}>{p.city}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="footer-contact-list">
              <li><a href={BUSINESS.phoneHref}><Phone size={15} /> {BUSINESS.phone}</a></li>
              <li><span><Clock size={15} /> {BUSINESS.hours}</span></li>
              <li><span><MapPin size={15} /> Mobile, based in Tustin, CA</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Aurum Auto Detailing. All rights reserved.</span>
          <span>Mobile Car Detailing · Tustin, CA</span>
        </div>
      </div>
    </footer>
  )
}
