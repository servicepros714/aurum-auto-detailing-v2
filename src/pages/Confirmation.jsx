import { useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Calendar, Clock, MapPin, Phone } from 'lucide-react'
import '../styles/confirmation.css'

export default function Confirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state?.bookingId) navigate('/', { replace: true })
  }, [state, navigate])

  if (!state?.bookingId) return null

  return (
    <div className="confirmation-page">
      <div className="container confirmation-container">
        <div className="confirmation-icon"><CheckCircle2 size={40} strokeWidth={2} /></div>
        <h1>You're all booked, {firstName(state.name)}!</h1>
        <p className="confirmation-sub">
          {state.paid
            ? "Your payment went through and your appointment is confirmed."
            : "Your appointment is confirmed — you'll pay when we arrive."}
        </p>

        <div className="confirmation-card">
          <div className="confirmation-row">
            <Calendar size={17} />
            <span>{state.date}</span>
          </div>
          <div className="confirmation-row">
            <Clock size={17} />
            <span>{formatTimeLabel(state.time)}</span>
          </div>
          <div className="confirmation-row">
            <MapPin size={17} />
            <span>{state.label}</span>
          </div>
          <div className="confirmation-total">
            <span>{state.paid ? 'Paid' : 'Total due at appointment'}</span>
            <strong>${state.total}</strong>
          </div>
        </div>

        <p className="confirmation-note">
          A confirmation has been sent to <b>{state.email}</b>. Questions or need to
          reschedule? Just give us a call.
        </p>

        <div className="confirmation-actions">
          <a href="tel:+17149424780" className="btn btn-outline btn-lg">
            <Phone size={16} /> (714) 942-4780
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

function formatTimeLabel(value) {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`
}
