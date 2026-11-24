import { Link } from 'react-router-dom'
import { Check, MapPin, Phone, ArrowRight } from 'lucide-react'
import { BUSINESS } from '../data/business'
import { SERVICES, ADD_ONS } from '../data/services'
import Services from '../components/Services'
import Faq from '../components/Faq'
import CTABanner from '../components/CTABanner'
import { ServiceChips, AreaChips } from '../components/ServiceLinks'
import useReveal from '../lib/useReveal'
import '../styles/seo.css'

// One template for every SEO landing page in src/lib/pages.js.

const basic = SERVICES.find((s) => s.id === 'basic')
const premium = SERVICES.find((s) => s.id === 'premium')
const exterior = ADD_ONS.find((a) => a.id === 'exterior')

// Hero price card: the Premium Detail, or 'combo' = Premium + Exterior Wash.
// The Exterior Wash is never shown as a product on its own.
function PriceCard({ page }) {
  const combo = page.card === 'combo'
  const name = combo ? `${premium.name} + ${exterior.name}` : premium.name
  const price = combo ? premium.price + exterior.price : premium.price
  const items = combo
    ? ['Everything in the Premium Detail', 'Full Interior Shampooing', 'Cloth & Carpet Extraction', 'Hand-Washed Exterior', 'Detailed Rim Cleaning', 'Spot-Free Hand Drying']
    : premium.features
  return (
    <aside className="au-card" aria-label={name}>
      <p className="au-card-badge">{combo ? 'Inside & out' : 'Most complete'}</p>
      <h2 className="au-card-name">{name}</h2>
      <p className="au-card-price">
        ${price}
        <span> any vehicle</span>
      </p>
      <ul className="au-card-list">
        {items.map((f) => (
          <li key={f}>
            <Check size={16} strokeWidth={3} aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link className="btn btn-primary btn-block" to="/book?package=premium">
        Book this detail
      </Link>
      <p className="au-card-note">
        {combo
          ? `Or the ${basic.name} + wash for $${basic.price + exterior.price}, or a detail alone from $${basic.price}.`
          : `Or the ${basic.name} for $${basic.price}. Prepay with code PREPAY to save $15.`}
      </p>
    </aside>
  )
}

// City pages: neighborhoods + map.
function Local({ page }) {
  return (
    <section className="au-local section-pad">
      <div className="container au-local-grid">
        <div>
          <div className="section-eyebrow">Service area</div>
          <h2 className="section-title">Where we work in {page.city}</h2>
          <p className="section-sub">
            We come to homes and workplaces across {page.city}. Not sure about your address? Call{' '}
            <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>.
          </p>
          <ul className="au-chips au-chips-static" aria-label={`${page.city} neighborhoods`}>
            {page.areas.map((a) => (
              <li key={a}>
                <span><MapPin size={14} aria-hidden="true" /> {a}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="map-embed">
          <iframe
            title={`Map of ${page.city}, CA`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(`${page.city}, CA`)}&z=12&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}

export default function Landing({ page }) {
  useReveal([page.path])
  const { intro } = page

  return (
    <>
      <section className="au-lp-hero">
        <div className="container au-lp-grid">
          <div>
            <nav className="au-crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{page.nav}</span>
            </nav>
            <div className="section-eyebrow">{page.eyebrow}</div>
            <h1 className="au-lp-title">
              {page.h1[0]} <em>{page.h1[1]}</em>
            </h1>
            <p className="hero-sub">{page.lede}</p>
            <div className="hero-cta-row">
              <Link className="btn btn-primary btn-lg" to={`/book?package=${page.pkg}`}>
                Book online <ArrowRight size={17} />
              </Link>
              <a className="btn btn-outline btn-lg" href={BUSINESS.phoneHref}>
                <Phone size={16} /> {BUSINESS.phone}
              </a>
            </div>
            <ul className="au-facts">
              {page.facts.map((f) => (
                <li key={f}>
                  <Check size={16} strokeWidth={3} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <PriceCard page={page} />
        </div>
      </section>

      <section className="au-intro section-pad">
        <div className="container au-intro-grid">
          <div>
            <h2 className="section-title">{intro.h2}</h2>
            {intro.paras.map((p) => (
              <p key={p} className="au-intro-p">{p}</p>
            ))}
          </div>
          <figure className="au-intro-photo">
            <img src={page.photo.src} alt={page.photo.alt} width={page.photo.w} height={page.photo.h} loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="au-points">
        <div className="container">
          <h2 className="section-title">{page.pointsTitle}</h2>
          <ul className="au-points-list">
            {page.points.map((pt) => (
              <li key={pt.title}>
                <h3>{pt.title}</h3>
                <p>{pt.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Services eyebrow="Packages" title={<>Prices for <em>every visit</em></>} showLinks={false} />

      {page.isCity && <Local page={page} />}

      <Faq
        faqs={page.faqs}
        title={page.isCity ? `${page.city} detailing questions` : `${page.nav} questions`}
      />

      <section className="au-related" aria-label="More from Aurum Auto Detailing">
        <div className="container">
          <h2 className="au-related-title">More detailing services</h2>
          <ServiceChips exclude={page.path} home />
          <h2 className="au-related-title">Areas we serve</h2>
          <AreaChips exclude={page.path} home />
        </div>
      </section>

      <CTABanner />
    </>
  )
}
