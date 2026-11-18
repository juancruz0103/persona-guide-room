import { Link } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { personaCardFocus } from '../../p5r/services/images';
import { personaImage } from '../services/images';
import { getArcana } from '../data/arcana';
import { PARTY_OWNER, personaName } from '../services/personas';
import type { Persona } from '../types';
import styles from '../../p5r/components/PersonaCard.module.css';
import { L } from '../../../i18n';

export function PersonaCard({ persona }: { persona: Persona }) {
  const arcana = getArcana(persona.arcana);
  const img = personaImage(persona.id, 'side');
  const badge = persona.party ? (
    <span className="tag tag--party">{L('Compañero', 'Party')}</span>
  ) : persona.special ? (
    <span className="tag tag--special">{L('Especial', 'Special')}</span>
  ) : null;
  return (
    <Link to={`/p5s/calculadora/persona/${persona.id}`} className={styles.card}>
      <ImagePlaceholder className={styles.image} src={img} focus={personaCardFocus(persona.id)}
        label={img ? personaName(persona) : L('Imagen de Persona', 'Persona image')} corner={arcana.numeral} badge={badge} />
      <div className={styles.body}>
        <span className={styles.name}>{personaName(persona)}</span>
        <div className={styles.meta}>
          <span className={styles.arcana}>{arcana.name}</span>
          {persona.party ? (
            <span className={styles.owner}>{L('de', 'of')} {PARTY_OWNER[persona.party] ?? ''}</span>
          ) : (
            <span className={styles.level}>{L('Nv', 'Lv')} <strong>{persona.level}</strong></span>
          )}
        </div>
      </div>
    </Link>
  );
}
