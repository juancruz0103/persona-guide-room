import { Link } from "react-router-dom";
import { getArcana } from "../data/arcana";
import { personaName } from "../services/gameText";
import type { Persona } from "../types";
import { personaImage } from "../services/images";
import { isSpoilerStage } from "../data/party";
import styles from "./PersonaPeek.module.css";

/**
 * Nombre de una Persona que lleva a su ficha. Al pasar el mouse (o con el
 * foco) muestra un recuadro con la foto, el Arcana y el nivel.
 */
export function PersonaPeek({
  persona,
  className,
  below = false,
  side = false,
  children,
}: {
  persona: Persona;
  className?: string;
  /** Mostrar el recuadro abajo en vez de arriba */
  below?: boolean;
  /** Mostrar el recuadro al costado (a la derecha); en celular pasa arriba */
  side?: boolean;
  children?: React.ReactNode;
}) {
  // Las formas evolucionadas de los compañeros son spoiler: sin foto en la vista previa
  const photo = isSpoilerStage(persona.party?.stage)
    ? undefined
    : personaImage(persona.id, "side");
  return (
    <span className={styles.peek}>
      <Link
        to={`/p5r/calculadora/persona/${persona.id}`}
        className={className ?? styles.link}
      >
        {children ?? personaName(persona)}
      </Link>
      <span
        className={`${styles.preview} ${below ? styles.below : ""} ${side ? styles.side : ""}`}
        aria-hidden="true"
      >
        {photo ? (
          <img
            className={styles.photoImg}
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className={`img-stripes ${styles.photo}`}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <rect x="3" y="4" width="18" height="16" rx="1" />
              <circle cx="9" cy="10" r="2" />
              <path d="M21 16l-5-5-9 9" />
            </svg>
            <span>Foto</span>
          </span>
        )}
        <span className={styles.previewName}>{personaName(persona)}</span>
        <span className={styles.previewMeta}>
          {getArcana(persona.arcana).name} · Nv {persona.level}
        </span>
      </span>
    </span>
  );
}
