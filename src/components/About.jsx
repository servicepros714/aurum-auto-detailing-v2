import { Link } from 'react-router-dom'
import { BadgeDollarSign, Clock, Droplets, Award } from 'lucide-react'
import '../styles/about.css'

const POINTS = [
  { icon: Clock, title: 'We Come To You', text: 'Home, office or apartment lot, every day from 8 AM to 5 PM. We bring our own water and power.' },
  { icon: Droplets, title: 'Hand-Applied Care', text: 'No automated tunnels. Every panel and seam is worked by hand.' },
  { icon: BadgeDollarSign, title: 'One Price, Any Vehicle', text: 'A compact car and a three-row SUV pay the same for each package.' },
  { icon: Award, title: 'Satisfaction Guaranteed', text: 'Not happy with something? Tell us and we will make it right.' },
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
            <strong>7</strong>
            <span>Days a Week<br />8 AM – 5 PM</span>
          </div>
        </div>

        <div className="about-content">
          <div className="section-eyebrow reveal">About Aurum</div>
          <h2 className="section-title reveal reveal-delay-1">
            Detailing that treats your car like <em>ours</em>
          </h2>
          <p className="section-sub reveal reveal-delay-2" style={{ marginBottom: 36 }}>
            Aurum Auto Detailing is a mobile detailing service based in Tustin.
            We detail your car where it is parked, in Tustin, North Tustin,
            Irvine, Santa Ana and Orange. A Basic Detail usually takes 1.5–2
            hours and a Premium Detail 3–4 hours.
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
