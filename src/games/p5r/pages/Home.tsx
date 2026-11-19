import { Link } from 'react-router-dom';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { p5rGame } from '../config';
import { HOME_STATS } from '../../../core/homeStats';
import styles from './Home.module.css';
import { L } from '../../../i18n';

export default function Home() {
  const [calc, conf, school] = p5rGame.tools;
  const thieves = HOME_STATS.p5r.thieves;

  return (
    <>
      <section className={styles.hero}>
        <div className={`halftone ${styles.dots}`} aria-hidden="true" />
        <div className={styles.slab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>{L('Guía interactiva · Persona 5 Royal', 'Interactive guide · Persona 5 Royal')}</span>
            <h1 className={styles.title}>
              {L('Fusioná.', 'Fuse.')}<br />{L('Conectá.', 'Connect.')}<br /><span>{L('Avanzá.', 'Advance.')}</span>
            </h1>
            <p className={styles.lead}>
              {L('Calculadora de fusiones y guía de confidentes en un solo lugar. Rápida de consultar en medio de la partida.', 'Fusion calculator and confidant guide in one place. Quick to check in the middle of your run.')}
            </p>
            <div className={styles.ctas}>
              <Link to="calculadora" className="btn btn--dark">{L('Abrir calculadora →', 'Open calculator →')}</Link>
              <Link to="confidentes" className="btn btn--light">{L('Ver confidentes', 'See confidants')}</Link>
            </div>
          </div>

          <ul className={styles.stats} aria-label={L('El proyecto en números', 'The project in numbers')}>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-accent)', ['--n' as string]: 'var(--c-accent)' }}>
              <strong>{HOME_STATS.p5r.personas}</strong><span>{L('Personas en el compendio', 'Personas in the compendium')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-text)', ['--n' as string]: 'var(--c-text)' }}>
              <strong>24</strong><span>{L('Arcanas', 'Arcana')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-primary)', ['--n' as string]: 'var(--c-primary-light)' }}>
              <strong>{thieves}</strong><span>{L('Ladrones Fantasma en la guía', 'Phantom Thieves in the guide')}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className={`container ${styles.tools}`}>
        <SectionTitle>{L('Herramientas', 'Tools')}</SectionTitle>
        <div className={styles.toolGrid}>
          <Link to={calc.path} className={`${styles.tool} ${styles.toolLight}`}>
            <span className={styles.toolNum}>01</span>
            <span className={styles.toolTitle}>{calc.title}</span>
            <span className={styles.toolDesc}>{calc.description}</span>
            <span className={styles.toolCta}>{L('Entrar →', 'Enter →')}</span>
          </Link>
          <Link to={conf.path} className={`${styles.tool} ${styles.toolRed}`}>
            <span className={styles.toolNum}>02</span>
            <span className={styles.toolTitle}>{conf.title}</span>
            <span className={styles.toolDesc}>{conf.description}</span>
            <span className={styles.toolCta}>{L('Entrar →', 'Enter →')}</span>
          </Link>
          <Link to={school.path} className={`${styles.tool} ${styles.toolGold}`}>
            <span className={styles.toolNum}>03</span>
            <span className={styles.toolTitle}>{school.title}</span>
            <span className={styles.toolDesc}>{school.description}</span>
            <span className={styles.toolCta}>{L('Entrar →', 'Enter →')}</span>
          </Link>
          <Link to="builds" className={`${styles.tool} ${styles.toolLight}`}>
            <span className={styles.toolNum}>04</span>
            <span className={styles.toolTitle}>{L('Builds de Personas', 'Persona builds')}</span>
            <span className={styles.toolDesc}>{L('Rutas de fusión paso a paso de la comunidad: qué heredar en cada fusión hasta la Persona final.', 'Step-by-step fusion routes from the community: what to inherit in each fusion up to the final Persona.')}</span>
            <span className={styles.toolCta}>{L('Entrar →', 'Enter →')}</span>
          </Link>
        </div>
      </section>
    </>
  );
}
