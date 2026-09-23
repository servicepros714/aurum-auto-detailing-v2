import { Link } from 'react-router-dom'
import { Sparkles, Clock, Droplets, Award } from 'lucide-react'
import '../styles/about.css'

const POINTS = [
  { icon: Clock, title: 'We Come To You', text: 'Home, office, or apartment lot — we bring water and power with us.' },
  { icon: Droplets, title: 'Hand-Applied Care', text: 'No automated tunnels. Every panel and seam is worked by hand.' },
  { icon: Sparkles, title: 'Premium Products', text: 'UV-protectant coatings and pH-balanced formulas that protect your finish.' },
  { icon: Award, title: 'Satisfaction Guaranteed', text: 'Not happy with a spot we missed? We come back and make it right.' },
]

export default function About() {
  return (
    <section id="about" className="about-section section-pad">
      <div className="container about-grid">
        <div className="about-visual reveal">
          <div className="about-shape" aria-hidden="true" />
          <img src="/images/gallery-4.jpg" alt="Aurum Auto Detailing hand-washing a vehicle exterior" className="about-img-main" />
          <img src="/images/gallery-5.jpg" alt="Freshly detailed vehicle finish" className="about-img-float" />
          <div className="about-badge">
            <strong>7+</strong>
            <span>Vehicle Types<br />Detailed Weekly</span>
          </div>
        </div>

        <div className="about-content">
          <div className="section-eyebrow reveal">About Aurum</div>
          <h2 className="section-title reveal reveal-delay-1">
            Detailing that treats your car like <em>ours</em>
          </h2>
          <p className="section-sub reveal reveal-delay-2" style={{ marginBottom: 36 }}>
            Aurum Auto Detailing is a mobile detailing team based in Tustin,
            serving Orange County drivers who want dealership-level results
            without the drop-off hassle. We show up on time, work with care,
            and leave every vehicle looking better than the day it left the lot.
          </p>

          <div className="about-points">
            {POINTS.map(({ icon: Icon, title, text }, i) => (
              <div className={`about-point reveal reveal-delay-${Math.min(i + 1, 4)}`} key={title}>
                <div className="about-point-icon"><Icon size={19} strokeWidth={2.2} /></div>
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>

          <Link to="/book" className="btn btn-chrome btn-lg reveal reveal-delay-3" style={{ marginTop: 36 }}>
            Schedule Your Detail
          </Link>
        </div>
      </div>
    </section>
  )
}
