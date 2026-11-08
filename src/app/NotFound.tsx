import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container" style={{ padding: '96px var(--gutter)', display: 'grid', gap: 24 }}>
      <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--c-primary)' }}>404</h1>
      <p style={{ fontSize: 20, margin: 0 }}>Esta página no existe (todavía).</p>
      <Link to="/p5r" className="btn btn--light" style={{ justifySelf: 'start' }}>
        Volver al inicio
      </Link>
    </section>
  );
}
