import { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Calendar, Clock, MapPin, Phone } from 'lucide-react'
import { markPaid } from '../lib/api'
import { formatBookingDate, loadCheckout, saveCheckout } from '../lib/checkout'
import { BUSINESS } from '../data/business'
import '../styles/confirmation.css'

export default function Confirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(location.state?.bookingId ? location.state : null)
  const [checked, setChecked] = useState(Boolean(location.state?.bookingId))

  // Normal path: Checkout navigates here with the booking in router state.
  // Fallback: a payment method that left the site returns with ?payment_intent=...&redirect_status=...
  useEffect(() => {
    if (location.state?.bookingId) return
    const params = new URLSearchParams(location.search)
    const piId = params.get('payment_intent')
    const saved = loadCheckout()
    if (piId && params.get('redirect_status') === 'succeeded' && saved?.bookingId) {
      markPaid(saved.bookingId, piId).catch(() => {}).finally(() => {
        saveCheckout(null)
        setBooking({ ...saved, paid: true })
        setChecked(true)
      })
      return
    }
    navigate('/', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!checked || !booking) return null

  return (
    <div className="confirmation-page">
      <div className="container confirmation-container">
        <div className="confirmation-icon"><CheckCircle2 size={40} strokeWidth={2} /></div>
        <h1>You're all booked, {firstName(booking.name)}!</h1>
        <p className="confirmation-sub">
          {booking.paid
            ? 'Your payment went through and your appointment is confirmed.'
            : "Your appointment is confirmed — you'll pay when we arrive."}
        </p>

        <div className="confirmation-card">
          <div className="confirmation-row">
            <Calendar size={17} />
            <span>{formatBookingDate(booking.date)}</span>
          </div>
          <div className="confirmation-row">
            <Clock size={17} />
            <span>{booking.time}</span>
          </div>
          <div className="confirmation-row">
            <MapPin size={17} />
            <span>{booking.label}</span>
          </div>
          <div className="confirmation-total">
            <span>{booking.paid ? 'Paid' : 'Total due at appointment'}</span>
            <strong>${booking.total}</strong>
          </div>
        </div>

        <p className="confirmation-note">
          A confirmation is on its way to <b>{booking.email}</b>. Questions or need to
          reschedule? Just give us a call.
        </p>

        <div className="confirmation-actions">
          <a href={BUSINESS.phoneHref} className="btn btn-outline btn-lg">
            <Phone size={16} /> {BUSINESS.phone}
          </a>
          <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

function firstName(full) {
  if (!full) return 'there'
  return full.trim().split(' ')[0]
}
