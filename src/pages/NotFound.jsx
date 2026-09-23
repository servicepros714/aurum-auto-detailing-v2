import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--black)',
      textAlign: 'center', padding: '40px 24px',
    }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,10vw,96px)', color: 'var(--white)' }}>404</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 16 }}>
        That page doesn't exist — but a fresh detail is still one click away.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
    </div>
  )
}
