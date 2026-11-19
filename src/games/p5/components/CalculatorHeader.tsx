import { Link, useLocation } from 'react-router-dom';
import { NoSpanishNote } from './NoSpanishNote';
import styles from '../../p5r/components/CalculatorHeader.module.css';
import { L } from '../../../i18n';

const TABS = () =>
  [
    { id: 'catalog', label: L('Catálogo', 'Catalog'), to: '/p5/calculadora' },
    { id: 'fuse', label: L('Fusionar', 'Fuse'), to: '/p5/calculadora/fusionar' },
    { id: 'reverse', label: L('¿Cómo la consigo?', 'How do I get it?'), to: '/p5/calculadora/fusionar?modo=inversa' },
  ] as const;

/** Banda roja con el título de la calculadora y sus pestañas. */
export function CalculatorHeader() {
  const { pathname, search } = useLocation();
  const active = pathname.endsWith('/fusionar')
      ? new URLSearchParams(search).get('modo') === 'inversa' ? 'reverse' : 'fuse'
      : 'catalog';

  return (
    <>
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>{L('Calculadora de Personas', 'Persona Calculator')}</h1>
        <nav className={styles.tabs} aria-label={L('Secciones de la calculadora', 'Calculator sections')}>
          {TABS().map((t) => (
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
    <NoSpanishNote />
    </>
  );
}
