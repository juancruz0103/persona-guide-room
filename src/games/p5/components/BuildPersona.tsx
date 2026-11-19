import { Link } from 'react-router-dom';
import type { BuildLearn } from '../../../core/account/builds';
import { getPersona } from '../services/personas';
import { personaName, skillName } from '../../p5r/services/gameText';
import { personaCardFocus, personaImage } from '../../p5r/services/images';
import { personaRequirement } from '../services/builds';
import styles from '../../p5r/components/BuildPersona.module.css';
import { L } from '../../../i18n';

interface Props {
  personaId: string;
  /** Habilidades importantes que pasa (ingrediente) o hereda (resultado) */
  skills?: string[];
  learn?: BuildLearn[];
  note?: string;
  /** «Del paso 3»: la Persona sale de un paso anterior */
  fromStep?: number;
  variant?: 'ingredient' | 'result' | 'final' | 'mini';
}

/** Cuadro de una Persona dentro de una build: foto, nombre y habilidades. Lleva a su perfil. */
export function BuildPersona({ personaId, skills = [], learn = [], note, fromStep, variant = 'ingredient' }: Props) {
  const p = getPersona(personaId);
  const img = personaImage(personaId, 'side');
  const req = p ? personaRequirement(p) : null;
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <Link to={`/p5/calculadora/persona/${personaId}`} className={styles.head} title={`${L('Ver perfil de', 'See profile of')} ${p ? personaName(p) : personaId}`}>
        <span className={styles.imgWrap}>
          {img ? (
            <img loading="lazy" decoding="async" src={img} alt="" className={styles.img} style={{ objectPosition: personaCardFocus(personaId) }} />
          ) : (
            <span className={styles.img} />
          )}
          {fromStep !== undefined && <span className={styles.from}>{L('Del paso', 'From step')} {fromStep}</span>}
          {req && variant !== 'mini' && (
            <span className={`${styles.req} ${styles[`req_${req.kind}`]}`}>{req.kind === 'story' ? L('Historia', 'Story') : req.text}</span>
          )}
        </span>
        <span className={styles.name}>
          <span>{p ? personaName(p) : personaId}</span>
          {p && <small>{L('Nv', 'Lv')} {p.level}</small>}
        </span>
      </Link>
      {note && <span className={styles.note}>{note}</span>}
      {(skills.length > 0 || learn.length > 0) && (
        <div className={styles.skills}>
          {skills.map((s) => (
            <span key={s} className={styles.chip}>{skillName(s)}</span>
          ))}
          {learn.map((l) => (
            <span key={l.skill} className={styles.learn} title={l.level ? L(`La aprende al subir al Nv ${l.level}`, `Learned at Lv ${l.level}`) : L('La trae de base', 'Innate')}>
              {l.level ? `${L('Nv', 'Lv')} ${l.level}` : L('Base', 'Innate')} · {skillName(l.skill)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
