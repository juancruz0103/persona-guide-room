import { Link } from 'react-router-dom';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { p5sGame } from '../config';
import { HOME_STATS } from '../../../core/homeStats';
import styles from '../../p5r/pages/Home.module.css';
import { L } from '../../../i18n';

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`halftone ${styles.dots}`} aria-hidden="true" />
        <div className={styles.slab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>{L('Guía interactiva · Persona 5 Strikers', 'Interactive guide · Persona 5 Strikers')}</span>
            <h1 className={styles.title}>
              {L('Viajá.', 'Travel.')}<br /><span>{L('Fusioná.', 'Fuse.')}</span><br />{L('Robá corazones.', 'Steal hearts.')}
            </h1>
            <p className={styles.lead}>
              {L('El compendio de Strikers con las recetas de fusión del juego, y las estadísticas, afinidades y habilidades de cada Persona.', "Strikers' compendium with the game's fusion recipes, and every Persona's stats, affinities and skills.")}
            </p>
            <div className={styles.ctas}>
              <Link to="calculadora" className="btn btn--dark">{L('Abrir calculadora →', 'Open calculator →')}</Link>
              <Link to="calculadora/fusionar" className="btn btn--light">{L('¿Cómo la consigo?', 'How do I get it?')}</Link>
            </div>
          </div>
          <ul className={styles.stats} aria-label={L('El proyecto en números', 'The project in numbers')}>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-accent)', ['--n' as string]: 'var(--c-accent)' }}>
              <strong>{HOME_STATS.p5s.personas}</strong><span>{L('Personas en el compendio', 'Personas in the compendium')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-text)', ['--n' as string]: 'var(--c-text)' }}>
              <strong>{HOME_STATS.p5s.special}</strong><span>{L('Fusiones especiales', 'Special fusions')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-primary)', ['--n' as string]: 'var(--c-primary-light)' }}>
              <strong>{HOME_STATS.p5s.party}</strong><span>{L('Personas de los Ladrones Fantasma', "Phantom Thieves' Personas")}</span>
            </li>
          </ul>
        </div>
      </section>
      <section className={`container ${styles.tools}`}>
        <SectionTitle>{L('Herramientas', 'Tools')}</SectionTitle>
        <div className={styles.toolGrid}>
          {p5sGame.tools.map((t, i) => (
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
