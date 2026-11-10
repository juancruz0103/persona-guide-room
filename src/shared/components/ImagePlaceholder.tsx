import type { ReactNode } from 'react';
import styles from './ImagePlaceholder.module.css';

interface Props {
  /** Texto que explica qué imagen va ahí */
  label: string;
  hint?: string;
  icon?: 'image' | 'person';
  /** Esquinas superiores: número de Arcana y una etiqueta (DLC, Especial...) */
  corner?: ReactNode;
  badge?: ReactNode;
  className?: string;
  /** Si hay foto, se muestra en lugar del marcador (las esquinas se mantienen) */
  src?: string;
  /** Encuadre de la foto (object-position), por ejemplo «50% 20%» */
  focus?: string;
}

/**
 * Marca el lugar donde irá una imagen oficial o ilustración.
 * Cuando haya imagen, este componente se reemplaza por <img> sin tocar el layout.
 */
export function ImagePlaceholder({ label, hint, icon = 'image', corner, badge, className, src, focus }: Props) {
  if (src)
    return (
      <div className={`${styles.box} ${styles.withImage} ${className ?? ''}`}>
        <img className={styles.img} src={src} alt={label} loading="lazy" decoding="async" style={focus ? { objectPosition: focus } : undefined} />
        {corner && <span className={styles.corner}>{corner}</span>}
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
    );
  return (
    <div className={`img-stripes ${styles.box} ${className ?? ''}`} role="img" aria-label={label}>
      {icon === 'image' ? (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <circle cx="9" cy="10" r="2" />
          <path d="M21 16l-5-5-9 9" />
        </svg>
      ) : (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      )}
      <span className={`label ${styles.text}`}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
      {corner && <span className={styles.corner}>{corner}</span>}
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
