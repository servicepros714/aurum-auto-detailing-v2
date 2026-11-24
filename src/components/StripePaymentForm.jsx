import { useState } from 'react'
import { ExpressCheckoutElement, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Lock, Loader2 } from 'lucide-react'

// Card form plus the Express Checkout buttons (Apple Pay, Google Pay, Link). Elements is
// created with the PaymentIntent's clientSecret, so both confirm the payment directly.
// onSuccess(paymentIntent) runs after Stripe accepts it; the Worker then verifies it.
export default function StripePaymentForm({ onSuccess, payLabel, name, email }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)
  const [expressReady, setExpressReady] = useState(false)
  const [error, setError] = useState(null)

  async function pay() {
    if (!stripe || !elements || submitting) return
    setSubmitting(true)
    setError(null)

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
        receipt_email: email || undefined,
      },
    })

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please check your card details.')
      setSubmitting(false)
      return
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      await onSuccess(paymentIntent)
    } else {
      setSubmitting(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    pay()
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className={`stripe-express${expressReady ? ' is-ready' : ''}`}>
        <ExpressCheckoutElement
          onConfirm={pay}
          onReady={(e) => setExpressReady(Boolean(e?.availablePaymentMethods))}
          options={{ buttonHeight: 48 }}
        />
      </div>
      {expressReady && <p className="stripe-divider"><span>or pay with card</span></p>}
      <PaymentElement
        onReady={() => setReady(true)}
        options={{ layout: 'tabs', defaultValues: { billingDetails: { name: name || '', email: email || '' } } }}
      />
      {error && <div className="stripe-error">{error}</div>}
      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!stripe || !ready || submitting} style={{ marginTop: 22 }}>
        {submitting ? <Loader2 size={18} className="spin-icon" /> : <><Lock size={16} /> {payLabel}</>}
      </button>
    </form>
  )
}
