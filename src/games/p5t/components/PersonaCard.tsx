import { Link } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { personaImage } from '../services/images';
import { isDlc, personaName, typeName } from '../services/personas';
import type { Persona } from '../types';
import styles from '../../p5r/components/PersonaCard.module.css';
import art from './Art.module.css';
import { L } from '../../../i18n';

export function PersonaCard({ persona }: { persona: Persona }) {
  const img = personaImage(persona.id);
  const badge = isDlc(persona) ? (
    <span className="tag tag--party">DLC</span>
  ) : persona.special ? (
    <span className="tag tag--special">{L('Especial', 'Special')}</span>
  ) : null;
  return (
    <Link to={`/p5t/calculadora/persona/${persona.id}`} className={styles.card}>
      <ImagePlaceholder className={`${styles.image} ${art.art}`} src={img}
        label={img ? personaName(persona) : L('Imagen de Persona', 'Persona image')} badge={badge} />
      <div className={styles.body}>
        <span className={styles.name}>{personaName(persona)}</span>
        <div className={styles.meta}>
          <span className={styles.arcana}>{typeName(persona.type)}</span>
          <span className={styles.level}>{L('Nv', 'Lv')} <strong>{persona.level}</strong></span>
        </div>
      </div>
    </Link>
  );
}
