import { Link } from 'react-router-dom';
import { getArcana } from '../data/arcana';
import { personaName } from '../services/text';
import type { Persona } from '../types';
import styles from '../../p5r/components/PersonaPeek.module.css';
import { L } from '../../../i18n';

export const isSpoiler = (p: Persona) => p.party?.stage === 'evolved';

/** Nombre que lleva a la ficha y, al pasar el cursor, muestra un recuadro con Arcana y nivel. */
export function PersonaPeek({ persona, below = false, className }: { persona: Persona; below?: boolean; className?: string }) {
  return (
    <span className={styles.peek}>
      <Link to={`/p3r/calculadora/persona/${persona.id}`} className={className ?? styles.link}>
        {personaName(persona)}
      </Link>
      <span className={`${styles.preview} ${below ? styles.below : ''}`} aria-hidden="true">
        <span className={`img-stripes ${styles.photo}`}>
          <span>{L('Foto', 'Photo')}</span>
        </span>
        <span className={styles.previewName}>{personaName(persona)}</span>
        <span className={styles.previewMeta}>
          {getArcana(persona.arcana).name}
          {!persona.party && <> · {L('Nv', 'Lv')} {persona.level}</>}
        </span>
      </span>
    </span>
  );
}
