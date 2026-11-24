import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isBefore, isSameDay, isSameMonth, startOfDay,
} from 'date-fns'
import BookingHeader from '../components/BookingHeader'
import BookingActionBar from '../components/BookingActionBar'
import { SERVICES, ADD_ONS, buildOrder } from '../data/services'
import { generateSlots, getPacificDateString, getMinimumLeadMinutes } from '../lib/slots'
import { getAvailability, createBooking } from '../lib/api'
import '../styles/booking.css'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Strips everything but digits and formats live as a US phone number:
// (714) 555-0123. Caps at 10 digits so no more can be typed.
function formatPhoneInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  const len = digits.length
  if (len === 0) return ''
  if (len < 4) return `(${digits}`
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export default function Book() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)

  const [serviceId, setServiceId] = useState(null)
  const [hasExterior, setHasExterior] = useState(false)

  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(null)

  const [selectedTime, setSelectedTime] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [form, setForm] = useState({ fullName: '', phone: '', email: '', vehicle: '', address: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const order = useMemo(() => buildOrder(serviceId, hasExterior), [serviceId, hasExterior])
  const selectedService = useMemo(() => SERVICES.find((s) => s.id === serviceId) || null, [serviceId])

  // Landing pages link to /book?package=basic|premium to preselect a package.
  useEffect(() => {
    const pkg = searchParams.get('package')
    if (SERVICES.some((s) => s.id === pkg)) setServiceId(pkg)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  useEffect(() => {
    if (step === 4 && selectedDate) {
      setLoadingSlots(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      getAvailability(dateStr)
        .then((res) => setBookedSlots(res?.booked || []))
        .catch(() => setBookedSlots([]))
        .finally(() => setLoadingSlots(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate])

  function goBack() {
    if (step === 1) { navigate('/'); return }
    setStep((s) => s - 1)
  }

  function goContinue() {
    if (step === 1) {
      if (!serviceId) { toast.error('Please select a detail package to continue.'); return }
      setStep(2)
      return
    }
    if (step === 2) {
      setStep(3)
      return
    }
    if (step === 3) {
      if (!selectedDate) { toast.error('Please choose a date to continue.'); return }
      setStep(4)
      return
    }
    if (step === 4) {
      if (!selectedTime) { toast.error('Please choose a time to continue.'); return }
      setStep(5)
      return
    }
    if (step === 5) {
      submitBooking()
    }
  }

  function validateForm() {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required.'
    if (!form.phone.trim()) next.phone = 'Phone number is required.'
    else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(form.phone.trim())) next.phone = 'Enter a 10-digit US phone number.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.vehicle.trim()) next.vehicle = 'Vehicle info is required.'
    if (!form.address.trim()) next.address = 'Service address is required.'
    setErrors(next)
    const firstKey = Object.keys(next)[0]
    if (firstKey) {
      const el = document.querySelector(`[name="${firstKey}"]`)
      if (el) el.focus()
    }
    return Object.keys(next).length === 0
  }

  async function submitBooking() {
    if (!validateForm() || !order) return
    setSubmitting(true)
    try {
      const payload = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        serviceId: order.service.id,
        exteriorAddOn: Boolean(order.addOn),
        name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        vehicle: form.vehicle.trim(),
        address: form.address.trim(),
      }
      const res = await createBooking(payload)
      navigate('/checkout', {
        state: {
          bookingId: res?.id,
          label: res?.service || order.label,
          total: res?.total ?? order.total,
          date: payload.date,
          time: selectedTime,
          name: payload.name,
          email: payload.email,
        },
      })
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth))
    const end = endOfWeek(endOfMonth(visibleMonth))
    return eachDayOfInterval({ start, end })
  }, [visibleMonth])

  const today = useMemo(() => {
    const [y, m, d] = getPacificDateString().split('-').map(Number)
    return startOfDay(new Date(y, m - 1, d))
  }, [])
  const canGoPrevMonth = isSameMonth(visibleMonth, today) === false && !isBefore(visibleMonth, today)

  const slots = useMemo(() => generateSlots(), [])
  const isSelectedDateToday = selectedDate ? isSameDay(selectedDate, today) : false
  const minLeadMinutes = useMemo(() => getMinimumLeadMinutes(), [step])
  const availableSlots = slots.filter((s) => {
    if (bookedSlots.includes(s.value)) return false
    if (isSelectedDateToday && s.minutes < minLeadMinutes) return false
    return true
  })

  return (
    <div className="booking-page">
      <BookingHeader step={step} />

      <div className="container booking-main">
        <div className="booking-card">

          {step === 1 && (
            <>
              <div className="booking-card-head">
                <h1>Choose your detail package</h1>
                <p>Select the interior service that fits your vehicle.</p>
              </div>
              <div className="booking-service-list">
                {SERVICES.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className={`booking-service-option ${serviceId === s.id ? 'is-selected' : ''}`}
                    onClick={() => setServiceId(s.id)}
                  >
                    <span className="booking-service-checkbox">
                      {serviceId === s.id && <Check size={14} color="#fff" strokeWidth={3} />}
                    </span>
                    <span className="booking-service-body">
                      <span className="booking-service-body-top">
                        <h3>{s.name}</h3>
                        <span className="booking-service-price">${s.price}</span>
                      </span>
                      <p className="tagline">{s.tagline}</p>
                      <span className="booking-service-feature-tags">
                        {s.features.map((f) => <span key={f}>{f}</span>)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="booking-card-head">
                <h1>Add an exterior wash?</h1>
                <p>
                  Optional — add a full hand wash &amp; shine to your{' '}
                  {selectedService ? selectedService.name : 'detail'}. Leave it off to continue with interior only.
                </p>
              </div>
              <div className="booking-addon-standalone">
                {ADD_ONS.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    className={`booking-addon-option is-standalone ${hasExterior ? 'is-selected' : ''}`}
                    onClick={() => setHasExterior((v) => !v)}
                  >
                    <span className="booking-addon-toggle" />
                    <span className="booking-addon-text">
                      <strong>Add {a.name}</strong>
                      <span>{a.tagline}</span>
                    </span>
                    <span className="booking-addon-price">+${a.price}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="booking-card-head">
                <h1>Pick a date</h1>
                <p>We come to you every day, with start times from 8:00 AM to 5:00 PM.</p>
              </div>
              <div className="booking-calendar">
                <div className="booking-calendar-head">
                  <h3>{format(visibleMonth, 'MMMM yyyy')}</h3>
                  <div className="booking-calendar-nav">
                    <button
                      type="button"
                      disabled={!canGoPrevMonth}
                      onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
                    >‹</button>
                    <button type="button" onClick={() => setVisibleMonth((m) => addMonths(m, 1))}>›</button>
                  </div>
                </div>
                <div className="booking-calendar-grid">
                  {DOW.map((d, i) => <div className="booking-calendar-dow" key={i}>{d}</div>)}
                  {calendarDays.map((day) => {
                    const inMonth = isSameMonth(day, visibleMonth)
                    const isPast = isBefore(day, today)
                    if (!inMonth) return <div className="booking-calendar-day is-empty" key={day.toISOString()} />
                    return (
                      <button
                        type="button"
                        key={day.toISOString()}
                        disabled={isPast}
                        className={`booking-calendar-day ${selectedDate && isSameDay(day, selectedDate) ? 'is-selected' : ''} ${isSameDay(day, today) ? 'is-today' : ''}`}
                        onClick={() => { setSelectedDate(day); setSelectedTime(null) }}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="booking-card-head">
                <h1>Pick a time</h1>
                <p>{selectedDate ? format(selectedDate, 'EEEE, MMMM d') : ''}</p>
              </div>
              {loadingSlots ? (
                <div className="booking-time-empty"><span className="spinner" style={{ margin: '0 auto' }} /></div>
              ) : availableSlots.length === 0 ? (
                <div className="booking-time-empty">No open slots left for this day — please choose another date.</div>
              ) : (
                <div className="booking-time-grid">
                  {availableSlots.map((s) => (
                    <button
                      type="button"
                      key={s.value}
                      className={`booking-time-slot ${selectedTime === s.value ? 'is-selected' : ''}`}
                      onClick={() => setSelectedTime(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <div className="booking-card-head">
                <h1>Your information</h1>
                <p>Last step — tell us where and how to reach you.</p>
              </div>

              {order && (
                <div className="booking-summary-strip">
                  <div className="booking-summary-strip-left">
                    <span>{selectedDate && format(selectedDate, 'EEE, MMM d')} · {slots.find(s => s.value === selectedTime)?.label}</span>
                    <strong>{order.label}</strong>
                  </div>
                  <div className="booking-summary-strip-total">${order.total}</div>
                </div>
              )}

              <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
                <div className="booking-form-row">
                  <div className={`booking-field ${errors.fullName ? 'has-error' : ''}`}>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName" name="fullName" type="text" placeholder="Jane Smith"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                    {errors.fullName && <span className="booking-field-error">{errors.fullName}</span>}
                  </div>
                  <div className={`booking-field ${errors.phone ? 'has-error' : ''}`}>
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone" name="phone" type="tel" inputMode="numeric" placeholder="Phone number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: formatPhoneInput(e.target.value) })}
                    />
                    {errors.phone && <span className="booking-field-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className={`booking-field ${errors.email ? 'has-error' : ''}`}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email" name="email" type="email" placeholder="jane@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <span className="booking-field-error">{errors.email}</span>}
                </div>

                <div className={`booking-field ${errors.vehicle ? 'has-error' : ''}`}>
                  <label htmlFor="vehicle">Vehicle (Year Make Model)</label>
                  <input
                    id="vehicle" name="vehicle" type="text" placeholder="2021 Toyota Sienna"
                    value={form.vehicle}
                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  />
                  {errors.vehicle && <span className="booking-field-error">{errors.vehicle}</span>}
                </div>

                <div className={`booking-field ${errors.address ? 'has-error' : ''}`}>
                  <label htmlFor="address">Service Address</label>
                  <input
                    id="address" name="address" type="text" placeholder="123 Main St, Tustin, CA"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  {errors.address && <span className="booking-field-error">{errors.address}</span>}
                </div>
              </form>
            </>
          )}

        </div>
      </div>

      <BookingActionBar
        onBack={goBack}
        onContinue={goContinue}
        continueLabel={step === 5 ? 'Continue to Payment' : 'Continue'}
        continueDisabled={
          (step === 1 && !serviceId) ||
          (step === 3 && !selectedDate) ||
          (step === 4 && !selectedTime)
        }
        loading={submitting}
      />
    </div>
  )
}