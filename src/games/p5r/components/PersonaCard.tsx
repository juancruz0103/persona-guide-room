import { Link } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import type { Persona } from '../types';
import { getArcana } from '../data/arcana';
import styles from './PersonaCard.module.css';

export function PersonaCard({ persona }: { persona: Persona }) {
  const arcana = getArcana(persona.arcana);
  const badge = persona.flags.dlc ? (
    <span className="tag tag--dlc">DLC</span>
  ) : persona.flags.special ? (
    <span className="tag tag--special">Especial</span>
  ) : persona.flags.treasure ? (
    <span className="tag tag--dlc">Tesoro</span>
  ) : null;

  return (
    <Link to={`/p5r/calculadora/persona/${persona.id}`} className={styles.card}>
      <ImagePlaceholder
        className={styles.image}
        label="Imagen de Persona"
        corner={arcana.numeral}
        badge={badge}
      />
      <div className={styles.body}>
        <span className={styles.name}>{persona.name}</span>
        <div className={styles.meta}>
          <span className={styles.arcana}>{arcana.name}</span>
          <span className={styles.level}>
            Nv <strong>{persona.level}</strong>
          </span>
        </div>
      </div>
    </Link>
  );
}
