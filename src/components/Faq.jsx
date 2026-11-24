import { FAQS } from '../data/business'
import '../styles/seo.css'

// FAQ list. The home page uses FAQS from src/data/business.js; landing pages pass
// their own. The same questions feed the FAQPage schema in src/lib/seo.js, so only
// questions shown here may appear in the schema.
export default function Faq({ faqs = FAQS, eyebrow = 'Questions', title = 'Mobile detailing questions', id = 'faq' }) {
  return (
    <section id={id} className="au-faq section-pad">
      <div className="container au-faq-grid">
        <div>
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="au-faq-list">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
