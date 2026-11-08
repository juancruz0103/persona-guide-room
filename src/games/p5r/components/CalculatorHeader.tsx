import { Link, useLocation } from 'react-router-dom';
import styles from './CalculatorHeader.module.css';

const TABS = [
  { id: 'catalog', label: 'Catálogo', to: '/p5r/calculadora' },
  { id: 'fuse', label: 'Fusionar', to: '/p5r/calculadora/fusionar' },
  { id: 'reverse', label: '¿Cómo la consigo?', to: '/p5r/calculadora/fusionar?modo=inversa' },
] as const;

/** Banda roja con el título de la calculadora y sus pestañas. */
export function CalculatorHeader() {
  const { pathname, search } = useLocation();
  const active =
    pathname.endsWith('/fusionar')
      ? new URLSearchParams(search).get('modo') === 'inversa' ? 'reverse' : 'fuse'
      : 'catalog';

  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>Calculadora de Personas</h1>
        <nav className={styles.tabs} aria-label="Secciones de la calculadora">
          {TABS.map((t) => (
            <Link
              key={t.id}
              to={t.to}
              aria-current={active === t.id ? 'page' : undefined}
              className={`btn ${active === t.id ? 'btn--dark' : 'btn--light'} ${styles.tab}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
