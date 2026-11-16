import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import { personaImage } from '../services/images';
import { maxPersona } from '../services/links';
import { linkImage } from '../data/linkImages';
import type { LinkMeta } from '../data/links';
import styles from './LinkPortrait.module.css';
import { L } from '../../../i18n';

/**
 * Imagen del vínculo: el retrato oficial del personaje o, si no hay, la Persona que se desbloquea al máximo.
 * Juicio va tapado con spoiler.
 */
export function LinkPortrait({ link, className }: { link: LinkMeta; className?: string }) {
  const own = linkImage(link.id);
  const p = maxPersona(link.arcana);
  const src = own ?? (p ? personaImage(p.id) : undefined);
  const box = (
    <div className={`${styles.box} p4g-art ${className ?? ''}`}>
      {src && <img src={src} alt="" className={own ? styles.char : styles.img} loading="lazy" decoding="async" />}
    </div>
  );
  return link.spoiler ? (
    <SpoilerCover active className={className} label={L('Spoiler · tocá para ver', 'Spoiler · tap to see')}>{box}</SpoilerCover>
  ) : (
    box
  );
}
