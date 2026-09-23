import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Lock, Loader2 } from 'lucide-react'

export default function StripePaymentForm({ onSuccess, payLabel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please check your card details.')
      setSubmitting(false)
      return
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      onSuccess(paymentIntent)
    } else {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <div className="stripe-error">{error}</div>}
      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!stripe || submitting} style={{ marginTop: 22 }}>
        {submitting ? <Loader2 size={18} className="spin-icon" /> : <><Lock size={16} /> {payLabel}</>}
      </button>
    </form>
  )
}
