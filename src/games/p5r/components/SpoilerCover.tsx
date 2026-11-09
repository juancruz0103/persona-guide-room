import { useState, type ReactNode } from 'react';
import styles from './SpoilerCover.module.css';

/**
 * Tapa contenido con spoilers hasta que el usuario lo toca.
 * Se usa en las imágenes de las Personas evolucionadas y del tercer semestre.
 */
export function SpoilerCover({
  active,
  children,
  className,
  label = 'Tocá para ver la imagen',
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const [shown, setShown] = useState(false);
  if (!active || shown) return <>{children}</>;
  return (
    <button
      type="button"
      className={`${styles.cover} ${className ?? ''}`}
      onClick={(e) => {
        // Dentro de una tarjeta-enlace: mostrar sin navegar
        e.preventDefault();
        e.stopPropagation();
        setShown(true);
      }}
      aria-label="Spoiler: mostrar la imagen"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3l18 18" />
        <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-2.6 3.2" />
        <path d="M6.5 7.6C4.3 9.2 3 12 3 12s4 6 9 6a8.7 8.7 0 0 0 4-1" />
      </svg>
      <span className={styles.title}>Spoiler</span>
      <span className={styles.hint}>{label}</span>
    </button>
  );
}
