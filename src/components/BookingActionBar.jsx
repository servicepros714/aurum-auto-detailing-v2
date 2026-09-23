import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

// Continue/Back controls for each booking step. Always rendered inline
// at the bottom of the step card; on mobile viewports the same bar
// becomes fixed to the bottom of the screen (see booking.css).
export default function BookingActionBar({
  onBack,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueDisabled = false,
  loading = false,
  hideBack = false,
}) {
  return (
    <div className="booking-action-bar">
      <div className="booking-action-bar-inner">
        {!hideBack ? (
          <button type="button" className="btn btn-outline booking-btn-back" onClick={onBack}>
            <ChevronLeft size={18} /> {backLabel}
          </button>
        ) : <span />}
        <button
          type="button"
          className="btn btn-primary booking-btn-continue"
          onClick={onContinue}
          disabled={continueDisabled || loading}
        >
          {loading ? <Loader2 size={18} className="spin-icon" /> : <>{continueLabel} <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  )
}
