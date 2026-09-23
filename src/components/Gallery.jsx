import { useState } from 'react'
import { Expand } from 'lucide-react'
import '../styles/gallery.css'

const IMAGES = [
  { src: '/images/gallery-2.jpg', alt: 'Freshly washed maroon Toyota Sienna, mirror-clean finish', tag: 'showroom', tall: true },
  { src: '/images/gallery-1.jpg', alt: 'Toyota Sienna covered in wash foam mid-detail', tag: 'foam' },
  { src: '/images/gallery-4.jpg', alt: 'Clean Honda Accord after full exterior hand wash', tag: 'showroom' },
  { src: '/images/gallery-3.jpg', alt: 'Honda CR-V covered in foam during a mobile wash', tag: 'foam', tall: true },
  { src: '/images/gallery-6.jpg', alt: 'Blue Toyota Corolla being foamed down on a mobile detail visit', tag: 'foam' },
  { src: '/images/gallery-5.jpg', alt: 'Aurum Auto Detailing technician rinsing a Honda Accord', tag: 'action' },
]

const FILTERS = [
  { id: 'all', label: 'All Work' },
  { id: 'showroom', label: 'Showroom Finish' },
  { id: 'foam', label: 'Foam Wash' },
  { id: 'action', label: 'On The Job' },
]

export default function Gallery() {
  const [active, setActive] = useState('all')
  const [lightbox, setLightbox] = useState(null)

  const shown = active === 'all' ? IMAGES : IMAGES.filter((i) => i.tag === active)

  return (
    <section id="gallery" className="gallery-section section-pad">
      <div className="container">
        <div className="gallery-head reveal">
          <div className="section-eyebrow">Recent Work</div>
          <h2 className="section-title">
            See the <em>Aurum</em> difference
          </h2>
        </div>

        <div className="gallery-filters reveal reveal-delay-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`gallery-filter-btn ${active === f.id ? 'is-active' : ''}`}
              onClick={() => setActive(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="gallery-masonry">
          {shown.map((img, i) => (
            <button
              type="button"
              key={img.src}
              className={`gallery-item reveal reveal-delay-${Math.min((i % 4) + 1, 4)} ${img.tall ? 'is-tall' : ''}`}
              onClick={() => setLightbox(img)}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
              <span className="gallery-item-zoom"><Expand size={18} /></span>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.alt} />
        </div>
      )}
    </section>
  )
}
