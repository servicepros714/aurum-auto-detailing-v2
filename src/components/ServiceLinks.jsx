import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { SERVICE_PAGES, CITY_PAGES, HOME_CITY } from '../lib/pages'
import '../styles/seo.css'

// Link chips to the SEO landing pages. Used on the home page (service area) and
// on every landing page ("more services" / "areas we serve"). `exclude` skips the
// page you are on.
export function ServiceChips({ exclude, home = false }) {
  return (
    <ul className="au-chips">
      {home && (
        <li><Link to="/">Mobile car detailing in {HOME_CITY}</Link></li>
      )}
      {SERVICE_PAGES.filter((p) => p.path !== exclude).map((p) => (
        <li key={p.path}><Link to={p.path}>{p.nav}</Link></li>
      ))}
    </ul>
  )
}

export function AreaChips({ exclude, home = false }) {
  return (
    <ul className="au-chips">
      {home && (
        <li><Link to="/#contact"><MapPin size={14} aria-hidden="true" /> {HOME_CITY}</Link></li>
      )}
      {CITY_PAGES.filter((p) => p.path !== exclude).map((p) => (
        <li key={p.path}><Link to={p.path}><MapPin size={14} aria-hidden="true" /> {p.city}</Link></li>
      ))}
    </ul>
  )
}
