import { Link } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { personaCardFocus, personaImage } from '../services/images';
import { getArcana } from '../data/arcana';
import { PARTY_OWNER } from '../services/personas';
import { personaName } from '../services/text';
import type { Persona } from '../types';
import styles from '../../p5r/components/PersonaCard.module.css';
import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import { isSpoiler } from './PersonaPeek';
import { L } from '../../../i18n';

export function PersonaCard({ persona }: { persona: Persona }) {
  const arcana = getArcana(persona.arcana);
  const badge = persona.party ? (
    <span className="tag tag--party">{L('Compañero', 'Party')}</span>
  ) : persona.flags.dlc ? (
    <span className="tag tag--dlc">DLC</span>
  ) : persona.flags.special ? (
    <span className="tag tag--special">{L('Especial', 'Special')}</span>
  ) : null;
  return (
    <Link to={`/p3r/calculadora/persona/${persona.id}`} className={styles.card}>
      <SpoilerCover active={isSpoiler(persona)} className={styles.image} label={L('Spoiler · tocá para ver', 'Spoiler · tap to see')}>
        <ImagePlaceholder className={styles.image} src={personaImage(persona.id, 'side')} focus={personaCardFocus(persona.id)} label={personaImage(persona.id, 'side') ? personaName(persona) : L('Imagen de Persona', 'Persona image')} corner={arcana.numeral} badge={badge} />
      </SpoilerCover>
      <div className={styles.body}>
        <span className={styles.name}>{personaName(persona)}</span>
        <div className={styles.meta}>
          <span className={styles.arcana}>{arcana.name}</span>
          {persona.party ? (
            <span className={styles.owner}>{L('de', 'of')} {PARTY_OWNER[persona.party.owner ?? ''] ?? ''}</span>
          ) : (
            <span className={styles.level}>{L('Nv', 'Lv')} <strong>{persona.level}</strong></span>
          )}
        </div>
      </div>
    </Link>
  );
}
