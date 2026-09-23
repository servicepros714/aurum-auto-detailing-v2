import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../styles/booking.css'

const STEPS = ['Service', 'Add-On', 'Date', 'Time', 'Your Info']

export default function BookingHeader({ step }) {
  return (
    <div className="booking-header">
      <div className="container booking-header-inner">
        <Link to="/" className="booking-back-home">
          <ChevronLeft size={17} /> Back to site
        </Link>
        <div className="booking-steps">
          {STEPS.map((label, i) => {
            const num = i + 1
            const state = num < step ? 'done' : num === step ? 'active' : 'upcoming'
            return (
              <div className={`booking-step booking-step-${state}`} key={label}>
                <span className="booking-step-dot">{num < step ? '✓' : num}</span>
                <span className="booking-step-label">{label}</span>
                {num < STEPS.length && <span className="booking-step-line" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
