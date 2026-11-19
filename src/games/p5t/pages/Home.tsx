import { Link } from 'react-router-dom';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { p5tGame } from '../config';
import { getAllPersonas, isDlc } from '../services/personas';
import styles from '../../p5r/pages/Home.module.css';
import { L } from '../../../i18n';

export default function Home() {
  const all = getAllPersonas();
  return (
    <>
      <section className={styles.hero}>
        <div className={`halftone ${styles.dots}`} aria-hidden="true" />
        <div className={styles.slab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>{L('Guía interactiva · Persona 5 Tactica', 'Interactive guide · Persona 5 Tactica')}</span>
            <h1 className={styles.title}>
              {L('Rebelate.', 'Rebel.')}<br /><span>{L('Fusioná.', 'Fuse.')}</span><br />{L('Liberá el reino.', 'Free the kingdom.')}
            </h1>
            <p className={styles.lead}>
              {L('El compendio de Tactica sacado de los archivos del juego: las fusiones normales y especiales, y las estadísticas y la habilidad de cada Persona.', "Tactica's compendium taken from the game files: normal and special fusions, and every Persona's stats and skill.")}
            </p>
            <div className={styles.ctas}>
              <Link to="calculadora" className="btn btn--dark">{L('Abrir calculadora →', 'Open calculator →')}</Link>
              <Link to="calculadora/fusionar" className="btn btn--light">{L('¿Cómo la consigo?', 'How do I get it?')}</Link>
            </div>
          </div>
          <ul className={styles.stats} aria-label={L('El proyecto en números', 'The project in numbers')}>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-accent)', ['--n' as string]: 'var(--c-accent)' }}>
              <strong>{all.filter((p) => !isDlc(p)).length}</strong><span>{L('Personas en el compendio', 'Personas in the compendium')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-text)', ['--n' as string]: 'var(--c-text)' }}>
              <strong>{all.filter((p) => p.special).length}</strong><span>{L('Fusiones especiales', 'Special fusions')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-primary)', ['--n' as string]: 'var(--c-primary-light)' }}>
              <strong>{all.filter(isDlc).length}</strong><span>{L('Personas de DLC', 'DLC Personas')}</span>
            </li>
          </ul>
        </div>
      </section>
      <section className={`container ${styles.tools}`}>
        <SectionTitle>{L('Herramientas', 'Tools')}</SectionTitle>
        <div className={styles.toolGrid}>
          {p5tGame.tools.map((t, i) => (
            <Link key={t.id} to={t.path} className={`${styles.tool} ${[styles.toolLight, styles.toolRed, styles.toolGold][i % 3]}`}>
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
