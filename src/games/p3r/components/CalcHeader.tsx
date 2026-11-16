import { Link, useLocation } from 'react-router-dom';
import styles from '../../p5r/components/CalculatorHeader.module.css';
import { L } from '../../../i18n';
import { useAigisMode } from '../services/aigisMode';

const TABS = () => [
  { id: 'catalog', label: L('Catálogo', 'Catalog'), to: '/p3r/calculadora' },
  { id: 'fuse', label: L('Fusionar', 'Fuse'), to: '/p3r/calculadora/fusionar' },
  { id: 'reverse', label: L('¿Cómo la consigo?', 'How do I get it?'), to: '/p3r/calculadora/fusionar?modo=inversa' },
  { id: 'special', label: L('Especiales', 'Special'), to: '/p3r/calculadora/especiales' },
  { id: 'hearts', label: L('Objetos de corazón', 'Heart items'), to: '/p3r/calculadora/corazones' },
];

export function CalcHeader() {
  const { pathname, search } = useLocation();
  const active = pathname.endsWith('/corazones')
    ? 'hearts'
    : pathname.endsWith('/especiales')
    ? 'special'
    : pathname.endsWith('/fusionar')
      ? new URLSearchParams(search).get('modo') === 'inversa' ? 'reverse' : 'fuse'
      : 'catalog';
  const [aigis, setAigis] = useAigisMode();
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
    {aigis && (
      <div className={styles.aigis} role="status">
        <div className="container">
          <span>
            <strong>{L('Modo Episodio Aigis activo', 'Episode Aigis mode on')}</strong>
            {' · '}
            {L('No hay vínculos: las Personas con requisitos se liberan al avanzar en la historia.', 'No Social Links: Personas with requirements unlock as you progress through the story.')}
          </span>
          <button type="button" onClick={() => setAigis(false)}>{L('Desactivar', 'Turn off')}</button>
        </div>
      </div>
    )}
    </>
  );
}
