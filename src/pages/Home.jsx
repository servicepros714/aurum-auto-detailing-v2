import { useEffect } from 'react'
import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import Gallery from '../components/Gallery'
import Reviews from '../components/Reviews'
import CTABanner from '../components/CTABanner'
import MapSection from '../components/MapSection'
import Faq from '../components/Faq'
import useReveal from '../lib/useReveal'

export default function Home() {
  useReveal()

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120)
      }
    }
  }, [])

  return (
    <>
      <Hero />
      <Services />
      <About />
      <Gallery />
      <Reviews />
      <Faq />
      <MapSection />
      <CTABanner />
    </>
  )
}
