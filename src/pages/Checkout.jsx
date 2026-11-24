import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ChevronLeft, Tag, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createPaymentIntent, markPaid, confirmPayLater, validateCoupon } from '../lib/api'
import { formatBookingDate, saveCheckout } from '../lib/checkout'
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
  const [confirming, setConfirming] = useState(false)

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
        // Kept for the rare payment method that leaves the site and comes back to /confirmation.
        saveCheckout({ ...state, total: res.amount })
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

  // Stripe accepted the payment. The Worker verifies it with Stripe, marks the booking
  // Paid and sends the confirmation email. The money is taken either way, so go on to
  // the confirmation page even if that call fails (the Stripe webhook can catch up).
  async function handlePaySuccess(paymentIntent) {
    try {
      await markPaid(state.bookingId, paymentIntent.id)
    } catch (_) {
      // non-blocking
    }
    saveCheckout(null)
    navigate('/confirmation', {
      state: { ...state, total: amount, paid: true },
    })
  }

  async function payLater() {
    if (confirming) return
    setConfirming(true)
    try {
      const res = await confirmPayLater(state.bookingId, state.email)
      saveCheckout(null)
      navigate('/confirmation', {
        state: { ...state, total: res?.total ?? state.total, paid: false },
      })
    } catch (err) {
      toast.error(err.message || 'Could not confirm your booking. Please call us.')
      setConfirming(false)
    }
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
            {formatBookingDate(state.date)} · {state.time}
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
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
              <StripePaymentForm
                onSuccess={handlePaySuccess}
                payLabel={`Pay $${amount} Securely`}
                name={state.name}
                email={state.email}
              />
            </Elements>
          )}
          <div className="checkout-secure-note">
            <ShieldCheck size={14} /> Payments are securely processed by Stripe.
          </div>
        </div>

        <button type="button" className="checkout-pay-later" onClick={payLater} disabled={confirming}>
          {confirming ? 'Confirming…' : "I'll pay later, at my appointment"}
        </button>
      </div>
    </div>
  )
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
