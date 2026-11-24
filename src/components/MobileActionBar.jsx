import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, CalendarCheck } from 'lucide-react'
import { BUSINESS } from '../data/business'
import '../styles/mobile-action-bar.css'

const PHONE_TEL = BUSINESS.phoneHref
const PHONE_DISPLAY = BUSINESS.phone

// Sticky bottom action bar shown only on mobile, only after the visitor
// scrolls past the hero. Hidden entirely on the booking flow pages, which
// use their own sticky Continue/Back bar instead.
export default function MobileActionBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const heroH = window.innerHeight * 0.7
    const onScroll = () => setVisible(window.scrollY > heroH)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`mobile-action-bar ${visible ? 'is-visible' : ''}`}>
      <a href={PHONE_TEL} className="mobile-action-btn mobile-action-call">
        <Phone size={18} strokeWidth={2.3} />
        <span>Call Now</span>
      </a>
      <Link to="/book" className="mobile-action-btn mobile-action-book">
        <CalendarCheck size={18} strokeWidth={2.3} />
        <span>Book Online</span>
      </Link>
    </div>
  )
}

export { PHONE_TEL, PHONE_DISPLAY }
