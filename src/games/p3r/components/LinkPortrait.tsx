import { useState } from 'react';
import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import { linkImage } from '../data/linkImages';
import type { ArcanaId } from '../types';
import styles from './LinkPortrait.module.css';
import { L } from '../../../i18n';

/** Vínculos que suben solos con la historia y cuyo personaje es spoiler. */
const SPOILER_LINKS: ArcanaId[] = ['judgement'];

/**
 * Ilustración oficial del vínculo.
 * - Loco: arranca con el primer collage de S.E.E.S.; un botón en la esquina muestra el
 *   collage completo (spoiler: aparecen miembros que se suman más adelante).
 * - Juicio: tapado con spoiler.
 */
export function LinkPortrait({ arcana, alt, className, compact }: { arcana: ArcanaId; alt: string; className?: string; compact?: boolean }) {
  const [full, setFull] = useState(false);
  const src = arcana === 'fool' ? linkImage('fool', full ? 6 : 1) : linkImage(arcana);
  if (!src) return null;
  const img = (
    <div className={`${styles.box} ${className ?? ''}`}>
      <img src={src} alt={alt} className={styles.img} loading="lazy" decoding="async" />
      {arcana === 'fool' && !compact && (
        <button type="button" className={styles.corner} onClick={() => setFull((f) => !f)} aria-pressed={full}>
          {full ? L('Ver primera versión', 'Show first version') : L('Ver completa · spoiler', 'Show full · spoiler')}
        </button>
      )}
    </div>
  );
  return SPOILER_LINKS.includes(arcana) ? (
    <SpoilerCover active className={className} label={L('Spoiler · tocá para ver', 'Spoiler · tap to see')}>{img}</SpoilerCover>
  ) : (
    img
  );
}
