import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react'
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
              Premium mobile car detailing serving Tustin and Orange County.
              We bring the shop to your driveway.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><Instagram size={17} /></a>
              <a href="#" aria-label="Facebook"><Facebook size={17} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigate</h4>
            <ul>
              <li><a href="/#services">Services</a></li>
              <li><a href="/#about">About</a></li>
              <li><a href="/#gallery">Gallery</a></li>
              <li><a href="/#reviews">Reviews</a></li>
              <li><Link to="/book">Book Online</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/book">Basic Detail — $150</Link></li>
              <li><Link to="/book">Premium Detail — $200</Link></li>
              <li><Link to="/book">Exterior Wash — +$50</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="footer-contact-list">
              <li><a href="tel:+17149424780"><Phone size={15} /> (714) 942-4780</a></li>
              <li><a href="mailto:info@aurumautodetailing.com"><Mail size={15} /> info@aurumautodetailing.com</a></li>
              <li><span><MapPin size={15} /> Tustin, CA — Serving Orange County</span></li>
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
