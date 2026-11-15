import { Link } from 'react-router-dom';
import { getArcana } from '../data/arcana';
import { personaName } from '../services/text';
import { personaImage } from '../services/images';
import type { Persona } from '../types';
import styles from '../../p5r/components/PersonaPeek.module.css';
import { L } from '../../../i18n';

export const isSpoiler = (p: Persona) => p.party?.stage === 'evolved';

/** Nombre que lleva a la ficha y, al pasar el cursor, muestra un recuadro con Arcana y nivel. */
export function PersonaPeek({ persona, below = false, className }: { persona: Persona; below?: boolean; className?: string }) {
  // Las evoluciones de los compañeros son spoiler: sin foto en la vista previa.
  const photo = isSpoiler(persona) ? undefined : personaImage(persona.id, 'side');
  return (
    <span className={styles.peek}>
      <Link to={`/p3r/calculadora/persona/${persona.id}`} className={className ?? styles.link}>
        {personaName(persona)}
      </Link>
      <span className={`${styles.preview} ${below ? styles.below : ''}`} aria-hidden="true">
        {photo ? (
          <img className={styles.photoImg} src={photo} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className={`img-stripes ${styles.photo}`}>
            <span>{isSpoiler(persona) ? 'Spoiler' : L('Foto', 'Photo')}</span>
          </span>
        )}
        <span className={styles.previewName}>{personaName(persona)}</span>
        <span className={styles.previewMeta}>
          {getArcana(persona.arcana).name}
          {!persona.party && <> · {L('Nv', 'Lv')} {persona.level}</>}
        </span>
      </span>
    </span>
  );
}
