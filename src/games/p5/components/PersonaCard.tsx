import { Link } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { personaCardFocus, personaImage } from '../../p5r/services/images';
import type { Persona } from '../../p5r/types';
import { getArcana } from '../../p5r/data/arcana';
import { PARTY_OWNER, isSpoilerStage } from '../../p5r/data/party';
import { personaName } from '../../p5r/services/gameText';
import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import styles from '../../p5r/components/PersonaCard.module.css';
import { L } from '../../../i18n';

export function PersonaCard({ persona }: { persona: Persona }) {
  const arcana = getArcana(persona.arcana);
  const party = persona.party;
  const badge = party ? (
    <span className="tag tag--party">{L('Compañero', 'Party')}</span>
  ) : persona.flags.dlc ? (
    <span className="tag tag--dlc">DLC</span>
  ) : persona.flags.special ? (
    <span className="tag tag--special">{L('Especial', 'Special')}</span>
  ) : persona.flags.treasure ? (
    <span className="tag tag--dlc">{L('Tesoro', 'Treasure')}</span>
  ) : null;

  return (
    <Link to={`/p5/calculadora/persona/${persona.id}`} className={styles.card}>
      <SpoilerCover active={isSpoilerStage(party?.stage)} className={styles.image}>
        <ImagePlaceholder
          className={styles.image}
          src={personaImage(persona.id, 'side')}
          focus={personaCardFocus(persona.id)}
          label={personaImage(persona.id, 'side') ? personaName(persona) : L('Imagen de Persona', 'Persona image')}
          corner={arcana.numeral}
          badge={badge}
        />
      </SpoilerCover>
      <div className={styles.body}>
        <span className={styles.name}>{personaName(persona)}</span>
        <div className={styles.meta}>
          <span className={styles.arcana}>{arcana.name}</span>
          {party ? (
            <span className={styles.owner}>{L(`de ${PARTY_OWNER[party.owner]}`, `${PARTY_OWNER[party.owner]}'s`)}</span>
          ) : (
            <span className={styles.level}>
              {L('Nv', 'Lv')} <strong>{persona.level}</strong>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
