import { Link } from 'react-router-dom';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { p4gGame } from '../config';
import { getAllPersonas } from '../services/personas';
import styles from '../../p5r/pages/Home.module.css';
import { L } from '../../../i18n';

export default function Home() {
  const [calc] = p4gGame.tools;
  const all = getAllPersonas();
  return (
    <>
      <section className={styles.hero}>
        <div className={`halftone ${styles.dots}`} aria-hidden="true" />
        <div className={styles.slab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>{L('Guía interactiva · Persona 4 Golden', 'Interactive guide · Persona 4 Golden')}</span>
            <h1 className={styles.title}>
              {L('Fusioná.', 'Fuse.')}<br /><span>{L('Conectá.', 'Connect.')}</span><br />{L('Resolvé el caso.', 'Solve the case.')}
            </h1>
            <p className={styles.lead}>
              {L('Calculadora de fusiones con las ilustraciones, los nombres y las descripciones oficiales del juego.', "Fusion calculator with the game's official artwork, names and descriptions.")}
            </p>
            <div className={styles.ctas}>
              <Link to="calculadora" className="btn btn--dark">{L('Abrir calculadora →', 'Open calculator →')}</Link>
              <Link to="calculadora/fusionar" className="btn btn--light">{L('Fusionar', 'Fuse')}</Link>
            </div>
          </div>
          <ul className={styles.stats} aria-label={L('El proyecto en números', 'The project in numbers')}>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-accent)', ['--n' as string]: 'var(--c-accent)' }}>
              <strong>{all.filter((p) => !p.party).length}</strong><span>{L('Personas en el compendio', 'Personas in the compendium')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-text)', ['--n' as string]: 'var(--c-text)' }}>
              <strong>{new Set(all.map((p) => p.arcana)).size}</strong><span>{L('Arcanas', 'Arcana')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-primary)', ['--n' as string]: 'var(--c-primary-light)' }}>
              <strong>{all.filter((p) => p.flags.special).length}</strong><span>{L('Fusiones especiales', 'Special fusions')}</span>
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
          <div className={`${styles.tool} ${styles.toolRed}`} aria-disabled="true">
            <span className={styles.toolNum}>02</span>
            <span className={styles.toolTitle}>{L('Vínculos sociales', 'Social Links')}</span>
            <span className={styles.toolDesc}>{L('En preparación.', 'Coming soon.')}</span>
          </div>
          <div className={`${styles.tool} ${styles.toolGold}`} aria-disabled="true">
            <span className={styles.toolNum}>03</span>
            <span className={styles.toolTitle}>{L('Respuestas de clase', 'Class answers')}</span>
            <span className={styles.toolDesc}>{L('En preparación.', 'Coming soon.')}</span>
          </div>
        </div>
      </section>
    </>
  );
}
