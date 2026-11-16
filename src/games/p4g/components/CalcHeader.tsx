import { Link, useLocation } from 'react-router-dom';
import styles from '../../p5r/components/CalculatorHeader.module.css';
import { L } from '../../../i18n';

const TABS = () => [
  { id: 'catalog', label: L('Catálogo', 'Catalog'), to: '/p4g/calculadora' },
  { id: 'fuse', label: L('Fusionar', 'Fuse'), to: '/p4g/calculadora/fusionar' },
  { id: 'reverse', label: L('¿Cómo la consigo?', 'How do I get it?'), to: '/p4g/calculadora/fusionar?modo=inversa' },
  { id: 'special', label: L('Especiales', 'Special'), to: '/p4g/calculadora/especiales' },
  { id: 'cards', label: 'Skill cards', to: '/p4g/calculadora/skill-cards' },
  { id: 'forecast', label: L('Pronóstico', 'Forecast'), to: '/p4g/calculadora/pronostico' },
];

export function CalcHeader() {
  const { pathname, search } = useLocation();
  const active = pathname.endsWith('/pronostico')
    ? 'forecast'
    : pathname.endsWith('/skill-cards')
    ? 'cards'
    : pathname.endsWith('/especiales')
    ? 'special'
    : pathname.endsWith('/fusionar')
      ? new URLSearchParams(search).get('modo') === 'inversa' ? 'reverse' : 'fuse'
      : 'catalog';
  return (
    <>
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>{L('Calculadora de Personas', 'Persona Calculator')}</h1>
        <nav className={styles.tabs} aria-label={L('Secciones de la calculadora', 'Calculator sections')}>
          {TABS().map((t) => (
            <Link key={t.id} to={t.to} aria-current={active === t.id ? 'page' : undefined}
              className={`btn ${active === t.id ? 'btn--dark' : 'btn--light'} ${styles.tab}`}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
    </>
  );
}
