import { MapPin, Clock, Phone } from 'lucide-react'
import { BUSINESS } from '../data/business'
import { AreaChips } from './ServiceLinks'
import '../styles/map-section.css'

const INFO = [
  { icon: MapPin, label: 'Service Area', value: 'Tustin, North Tustin, Irvine, Santa Ana & Orange' },
  { icon: Clock, label: 'Hours', value: BUSINESS.hours },
  { icon: Phone, label: 'Call', value: BUSINESS.phone, href: BUSINESS.phoneHref },
]

export default function MapSection() {
  return (
    <section id="contact" className="map-section section-pad">
      <div className="container map-grid">
        <div className="map-info reveal">
          <div className="section-eyebrow">Service Area</div>
          <h2 className="section-title">Mobile detailing, <em>based in Tustin</em></h2>
          <p className="section-sub" style={{ marginBottom: 20 }}>
            We come to homes and workplaces across Tustin, including{' '}
            {BUSINESS.areas.slice(0, 4).join(', ')}, and to these nearby cities
            at the same prices:
          </p>
          <div style={{ marginBottom: 32 }}>
            <AreaChips />
          </div>
          <div className="map-info-list">
            {INFO.map(({ icon: Icon, label, value, href }) => (
              <div className="map-info-item" key={label}>
                <div className="map-info-icon"><Icon size={18} strokeWidth={2.2} /></div>
                <div>
                  <span>{label}</span>
                  <strong>{href ? <a href={href}>{value}</a> : value}</strong>
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
