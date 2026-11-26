import { Link } from 'react-router-dom';
import { getArcana } from '../data/arcana';
import { personaName } from '../services/text';
import { personaImage } from '../services/images';
import type { Persona } from '../types';
import styles from './PersonaPeek.module.css';
import { L } from '../../../i18n';

/** Las evoluciones de los compañeros son spoiler. */
export const isSpoiler = (p: Persona) => !!p.party && p.party.stage !== 'initial';

/** Nombre que lleva a la ficha y, al pasar el cursor, muestra un recuadro con Arcana y nivel. */
export function PersonaPeek({ persona, below = false, className }: { persona: Persona; below?: boolean; className?: string }) {
  // Las evoluciones de los compañeros son spoiler: sin foto en la vista previa.
  const photo = isSpoiler(persona) ? undefined : personaImage(persona.id);
  return (
    <span className={styles.peek}>
      <Link to={`/p4r/calculadora/persona/${persona.id}`} className={className ?? styles.link}>
        {personaName(persona)}
      </Link>
      <span className={`${styles.preview} ${below ? styles.below : ''}`} aria-hidden="true">
        {photo ? (
          <img className={styles.photoImg} src={photo} alt="" loading="lazy" decoding="async" style={{ objectFit: 'contain', padding: 6, background: 'radial-gradient(circle at 50% 40%, #3a321c 0%, #211d12 75%)' }} />
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
