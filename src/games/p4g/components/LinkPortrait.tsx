import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import { personaImage } from '../services/images';
import { maxPersona } from '../services/links';
import type { LinkMeta } from '../data/links';
import styles from './LinkPortrait.module.css';
import { L } from '../../../i18n';

/**
 * Imagen del vínculo: la Persona que se desbloquea al llevarlo al máximo, con el fondo cálido del Golden.
 * Juicio va tapado con spoiler.
 */
export function LinkPortrait({ link, className }: { link: LinkMeta; className?: string }) {
  const p = maxPersona(link.arcana);
  const src = p ? personaImage(p.id) : undefined;
  const box = (
    <div className={`${styles.box} p4g-art ${className ?? ''}`}>
      {src && <img src={src} alt="" className={styles.img} loading="lazy" decoding="async" />}
    </div>
  );
  return link.spoiler ? (
    <SpoilerCover active className={className} label={L('Spoiler · tocá para ver', 'Spoiler · tap to see')}>{box}</SpoilerCover>
  ) : (
    box
  );
}
