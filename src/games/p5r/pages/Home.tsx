import { Link } from 'react-router-dom';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { p5rGame } from '../config';
import { CONFIDANTS } from '../services/confidants';
import { getAllPersonas } from '../services/personas';
import styles from './Home.module.css';

export default function Home() {
  const [calc, conf] = p5rGame.tools;
  const thieves = CONFIDANTS.filter((c) => c.phantomThief).length;

  return (
    <>
      <section className={styles.hero}>
        <div className={`halftone ${styles.dots}`} aria-hidden="true" />
        <div className={styles.slab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>Guía interactiva · Persona 5 Royal</span>
            <h1 className={styles.title}>
              Fusioná.<br />Conectá.<br /><span>Avanzá.</span>
            </h1>
            <p className={styles.lead}>
              Calculadora de fusiones y guía de confidentes en un solo lugar. Rápida de consultar en medio de la partida.
            </p>
            <div className={styles.ctas}>
              <Link to="calculadora" className="btn btn--dark">Abrir calculadora →</Link>
              <Link to="confidentes" className="btn btn--light">Ver confidentes</Link>
            </div>
          </div>

          <ul className={styles.stats} aria-label="El proyecto en números">
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-accent)', ['--n' as string]: 'var(--c-accent)' }}>
              <strong>{getAllPersonas().length}</strong><span>Personas en el compendio</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-text)', ['--n' as string]: 'var(--c-text)' }}>
              <strong>24</strong><span>Arcanas</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-primary)', ['--n' as string]: 'var(--c-primary-light)' }}>
              <strong>{thieves}</strong><span>Ladrones Fantasma en la guía</span>
            </li>
          </ul>
        </div>
      </section>

      <section className={`container ${styles.tools}`}>
        <SectionTitle>Herramientas</SectionTitle>
        <div className={styles.toolGrid}>
          <Link to={calc.path} className={`${styles.tool} ${styles.toolLight}`}>
            <span className={styles.toolNum}>01</span>
            <span className={styles.toolTitle}>{calc.title}</span>
            <span className={styles.toolDesc}>{calc.description}</span>
            <span className={styles.toolCta}>Entrar →</span>
          </Link>
          <Link to={conf.path} className={`${styles.tool} ${styles.toolRed}`}>
            <span className={styles.toolNum}>02</span>
            <span className={styles.toolTitle}>{conf.title}</span>
            <span className={styles.toolDesc}>{conf.description}</span>
            <span className={styles.toolCta}>Entrar →</span>
          </Link>
          <div className={`${styles.tool} ${styles.toolSoon}`}>
            <span className={styles.toolNum}>03</span>
            <span className={styles.toolTitle}>Próximamente</span>
            <span className={styles.toolDesc}>Seguimiento de progreso con tu cuenta, Personas favoritas y más herramientas.</span>
            <span className={styles.toolCta}>En desarrollo</span>
          </div>
        </div>
      </section>
    </>
  );
}
