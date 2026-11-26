import { Link } from 'react-router-dom';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { p4rGame } from '../config';
import { HOME_STATS } from '../../../core/homeStats';
import styles from '../../p5r/pages/Home.module.css';
import { L } from '../../../i18n';
import { PreviewBanner } from '../components/PreviewBanner';

export default function Home() {
  return (
    <>
      <PreviewBanner />
      <section className={styles.hero}>
        <div className={`halftone ${styles.dots}`} aria-hidden="true" />
        <div className={styles.slab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>{L('Guía interactiva · Persona 4 Revival', 'Interactive guide · Persona 4 Revival')}</span>
            <h1 className={styles.title}>
              {L('Fusioná.', 'Fuse.')}<br /><span>{L('Conectá.', 'Connect.')}</span><br />{L('Resolvé el caso.', 'Solve the case.')}
            </h1>
            <p className={styles.lead}>
              {L('Calculadora de fusiones, vínculos, respuestas de clase y builds, con las ilustraciones y los textos oficiales del juego.', "Fusion calculator, Social Links, class answers and builds, with the game's official artwork and text.")}
            </p>
            <div className={styles.ctas}>
              <Link to="calculadora" className="btn btn--dark">{L('Abrir calculadora →', 'Open calculator →')}</Link>
              <Link to="calculadora/fusionar" className="btn btn--light">{L('Fusionar', 'Fuse')}</Link>
            </div>
          </div>
          <ul className={styles.stats} aria-label={L('El proyecto en números', 'The project in numbers')}>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-accent)', ['--n' as string]: 'var(--c-accent)' }}>
              <strong>{HOME_STATS.p4r.personas}</strong><span>{L('Personas en el compendio', 'Personas in the compendium')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-text)', ['--n' as string]: 'var(--c-text)' }}>
              <strong>{HOME_STATS.p4r.arcana}</strong><span>{L('Arcanas', 'Arcana')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-primary)', ['--n' as string]: 'var(--c-primary-light)' }}>
              <strong>{HOME_STATS.p4r.special}</strong><span>{L('Fusiones especiales', 'Special fusions')}</span>
            </li>
          </ul>
        </div>
      </section>
      <section className={`container ${styles.tools}`}>
        <SectionTitle>{L('Herramientas', 'Tools')}</SectionTitle>
        <div className={styles.toolGrid}>
          {p4rGame.tools.map((t, i) => (
            // Tarjetas en amarillo, naranja y blanco con texto oscuro (el fondo de Revival es claro)
            <Link key={t.id} to={t.path} className={`${styles.tool} ${styles.toolLight}`}
              style={{ ['--c-paper' as string]: ['#ff9a00', '#ffe600', '#ffffff'][i % 3], ['--c-primary' as string]: '#1b1b1b', ['--c-primary-strong' as string]: '#1b1b1b' }}>
              <span className={styles.toolNum}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.toolTitle}>{t.title}</span>
              <span className={styles.toolDesc}>{t.description}</span>
              <span className={styles.toolCta}>{L('Entrar →', 'Enter →')}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
