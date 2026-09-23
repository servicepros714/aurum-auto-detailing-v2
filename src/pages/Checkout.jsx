import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ChevronLeft, Tag, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createPaymentIntent, confirmPayment, validateCoupon } from '../lib/api'
import StripePaymentForm from '../components/StripePaymentForm'
import '../styles/checkout.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const PREPAY_DISCOUNT = 15

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)

  const [clientSecret, setClientSecret] = useState(null)
  const [amount, setAmount] = useState(state?.total || 0)
  const [loadingIntent, setLoadingIntent] = useState(true)

  useEffect(() => {
    if (!state?.bookingId) {
      navigate('/book', { replace: true })
    }
  }, [state, navigate])

  useEffect(() => {
    if (!state?.bookingId) return
    setLoadingIntent(true)
    createPaymentIntent({
      bookingId: state.bookingId,
      coupon: couponApplied ? 'PREPAY' : null,
    })
      .then((res) => {
        setClientSecret(res.clientSecret)
        setAmount(res.amount)
      })
      .catch((err) => toast.error(err.message || 'Could not start checkout.'))
      .finally(() => setLoadingIntent(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.bookingId, couponApplied])

  if (!state?.bookingId) return null

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await validateCoupon(couponCode.trim())
      if (res?.valid) {
        setCouponApplied(true)
        toast.success(`$${PREPAY_DISCOUNT} off applied!`)
      } else {
        toast.error('That code is not valid.')
      }
    } catch (err) {
      toast.error(err.message || 'Could not validate that code.')
    } finally {
      setCouponLoading(false)
    }
  }

  async function handlePaySuccess() {
    try {
      await confirmPayment({ bookingId: state.bookingId })
    } catch (_) {
      // booking still exists even if this confirmation call fails — non-blocking
    }
    navigate('/confirmation', {
      state: { ...state, total: amount, paid: true },
    })
  }

  function payLater() {
    navigate('/confirmation', {
      state: { ...state, paid: false },
    })
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-container">
        <Link to="/book" className="checkout-back-link">
          <ChevronLeft size={16} /> Back
        </Link>
        <div className="section-eyebrow">Secure Checkout</div>

        {!couponApplied && (
          <div className="prepay-banner">
            <div>
              <strong>Prepay &amp; save ${PREPAY_DISCOUNT}</strong>
              <span> — use code <b>PREPAY</b> below and pay today instead of at your appointment.</span>
            </div>
          </div>
        )}

        <div className="checkout-summary-card">
          <div className="checkout-summary-row">
            <span>{state.label}</span>
            <strong>${amount}</strong>
          </div>
          <div className="checkout-summary-meta">
            {state.date} · {state.time && formatTimeLabel(state.time)}
          </div>
        </div>

        <div className="checkout-coupon">
          <Tag size={16} />
          <input
            type="text"
            placeholder="Coupon code"
            value={couponCode}
            disabled={couponApplied}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          {couponApplied ? (
            <span className="checkout-coupon-applied"><CheckCircle2 size={16} /> Applied</span>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={applyCoupon} disabled={couponLoading}>
              {couponLoading ? <Loader2 size={15} className="spin-icon" /> : 'Apply'}
            </button>
          )}
        </div>

        <div className="checkout-payment-card">
          {loadingIntent || !clientSecret ? (
            <div className="checkout-loading"><span className="spinner" /></div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
              <StripePaymentForm onSuccess={handlePaySuccess} payLabel={`Pay $${amount} Securely`} />
            </Elements>
          )}
          <div className="checkout-secure-note">
            <ShieldCheck size={14} /> Payments are securely processed by Stripe.
          </div>
        </div>

        <button type="button" className="checkout-pay-later" onClick={payLater}>
          I'll pay later, at my appointment
        </button>
      </div>
    </div>
  )
}

function formatTimeLabel(value) {
  const [h, m] = value.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`
}

const stripeAppearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#c11e22',
    colorBackground: '#131315',
    colorText: '#f7f7f8',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px',
  },
}
