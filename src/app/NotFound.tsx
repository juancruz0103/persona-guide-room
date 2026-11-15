import { Link } from 'react-router-dom';
import { L } from '../i18n';
import { useGameBase } from '../shared/hooks/useGameBase';

export default function NotFound() {
  const base = useGameBase();
  return (
    <section className="container" style={{ padding: '96px var(--gutter)', display: 'grid', gap: 24 }}>
      <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--c-primary)' }}>404</h1>
      <p style={{ fontSize: 20, margin: 0 }}>{L('Esta página no existe (todavía).', 'This page does not exist (yet).')}</p>
      <Link to={base} className="btn btn--light" style={{ justifySelf: 'start' }}>
        {L('Volver al inicio', 'Back to home')}
      </Link>
    </section>
  );
}
