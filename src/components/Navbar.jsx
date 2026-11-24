import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, CalendarCheck } from 'lucide-react'
import { BUSINESS, REVIEWS } from '../data/business'
import '../styles/navbar.css'

const LINKS = [
  { to: '/#services', label: 'Services' },
  { to: '/#about', label: 'About' },
  { to: '/#gallery', label: 'Gallery' },
  ...(REVIEWS.length ? [{ to: '/#reviews', label: 'Reviews' }] : []),
  { to: '/#faq', label: 'FAQ' },
  { to: '/#contact', label: 'Service Area' },
]

const PHONE_DISPLAY = BUSINESS.phone
const PHONE_TEL = BUSINESS.phoneHref

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo" aria-label="Aurum Auto Detailing home">
            <img src="/images/logo.png" alt="Aurum Auto Detailing" />
          </Link>

          <nav className="navbar-links" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.label} href={l.to}>{l.label}</a>
            ))}
          </nav>

          <div className="navbar-actions">
            <a href={PHONE_TEL} className="navbar-phone">
              <Phone size={16} strokeWidth={2.4} />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <Link to="/book" className="btn btn-primary btn-sm">Book Now</Link>
          </div>

          <button
            className="navbar-burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className={`navbar-mobile-panel ${open ? 'is-open' : ''}`}>
        <nav aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a
              key={l.label}
              href={l.to}
              style={{ transitionDelay: `${i * 0.05}s` }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="navbar-mobile-footer">
          <a href={PHONE_TEL} className="btn btn-outline btn-block">
            <Phone size={17} /> {PHONE_DISPLAY}
          </a>
          <Link to="/book" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
            <CalendarCheck size={17} /> Book Online
          </Link>
        </div>
      </div>
    </>
  )
}
