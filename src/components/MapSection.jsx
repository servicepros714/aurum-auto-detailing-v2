import { MapPin, Clock, Mail, Phone } from 'lucide-react'
import '../styles/map-section.css'

const INFO = [
  { icon: MapPin, label: 'Service Area', value: 'Tustin, CA & Orange County' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sun, by appointment' },
  { icon: Phone, label: 'Call or Text', value: '(714) 942-4780' },
]

export default function MapSection() {
  return (
    <section id="contact" className="map-section section-pad">
      <div className="container map-grid">
        <div className="map-info reveal">
          <div className="section-eyebrow">Find Us</div>
          <h2 className="section-title">Mobile detailing, <em>based in Tustin</em></h2>
          <p className="section-sub" style={{ marginBottom: 32 }}>
            We travel throughout Orange County — from Tustin and Irvine to
            Santa Ana, Orange, and beyond. Tell us your address at booking
            and we'll confirm the visit.
          </p>
          <div className="map-info-list">
            {INFO.map(({ icon: Icon, label, value }) => (
              <div className="map-info-item" key={label}>
                <div className="map-info-icon"><Icon size={18} strokeWidth={2.2} /></div>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-embed reveal reveal-delay-1">
          <iframe
            title="Aurum Auto Detailing service area map"
            src="https://www.google.com/maps?q=Tustin,CA&z=11&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
