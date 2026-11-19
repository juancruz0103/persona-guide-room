import { Link } from 'react-router-dom';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { p5Game } from '../config';
import { getAllPersonas, getPartyPersonas } from '../services/personas';
import { NoSpanishNote } from '../components/NoSpanishNote';
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
            <span className={styles.kicker}>{L('Guía interactiva · Persona 5', 'Interactive guide · Persona 5')}</span>
            <h1 className={styles.title}>
              {L('El original.', 'The original.')}<br />{L('Fusioná.', 'Fuse.')}<br /><span>{L('Robá corazones.', 'Steal hearts.')}</span>
            </h1>
            <p className={styles.lead}>
              {L('La calculadora de Persona 5 original: solo las Personas, niveles y fusiones de ese juego, sin lo que se agregó en Royal.', "The original Persona 5's calculator: only that game's Personas, levels and fusions, without what Royal added.")}
            </p>
            <div className={styles.ctas}>
              <Link to="calculadora" className="btn btn--dark">{L('Abrir calculadora →', 'Open calculator →')}</Link>
              <Link to="calculadora/fusionar?modo=inversa" className="btn btn--light">{L('¿Cómo la consigo?', 'How do I get it?')}</Link>
            </div>
          </div>
          <ul className={styles.stats} aria-label={L('El proyecto en números', 'The project in numbers')}>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-accent)', ['--n' as string]: 'var(--c-accent)' }}>
              <strong>{all.length}</strong><span>{L('Personas en el compendio', 'Personas in the compendium')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-text)', ['--n' as string]: 'var(--c-text)' }}>
              <strong>21</strong><span>{L('Arcanas', 'Arcana')}</span>
            </li>
            <li className={styles.stat} style={{ ['--b' as string]: 'var(--c-primary)', ['--n' as string]: 'var(--c-primary-light)' }}>
              <strong>{all.filter((p) => p.flags.special).length}</strong><span>{L('Fusiones especiales', 'Special fusions')}</span>
            </li>
          </ul>
        </div>
      </section>
      <NoSpanishNote />
      <section className={`container ${styles.tools}`}>
        <SectionTitle>{L('Herramientas', 'Tools')}</SectionTitle>
        <div className={styles.toolGrid}>
          {p5Game.tools.map((t, i) => (
            <Link key={t.id} to={t.path} className={`${styles.tool} ${[styles.toolLight, styles.toolRed, styles.toolGold][i % 3]}`}>
              <span className={styles.toolNum}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.toolTitle}>{t.title}</span>
              <span className={styles.toolDesc}>{t.description}</span>
              <span className={styles.toolCta}>{L('Entrar →', 'Enter →')}</span>
            </Link>
          ))}
        </div>
        <p style={{ color: 'var(--c-text-muted)' }}>{L(`También tiene la ficha de las ${getPartyPersonas().length} Personas de los Ladrones Fantasma. Los confidentes llegan pronto.`, `It also has the profile of the Phantom Thieves' ${getPartyPersonas().length} Personas. Confidants coming soon.`)}</p>
      </section>
    </>
  );
}
