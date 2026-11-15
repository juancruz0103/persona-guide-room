import { Link } from 'react-router-dom';
import type { BuildLearn } from '../../../core/account/builds';
import { getPersona } from '../services/personas';
import { personaName, skillName } from '../services/gameText';
import { personaCardFocus, personaImage } from '../services/images';
import { personaRequirement } from '../services/builds';
import styles from './BuildPersona.module.css';

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
      <Link to={`/p5r/calculadora/persona/${personaId}`} className={styles.head} title={`Ver perfil de ${p ? personaName(p) : personaId}`}>
        <span className={styles.imgWrap}>
          {img ? (
            <img src={img} alt="" className={styles.img} style={{ objectPosition: personaCardFocus(personaId) }} />
          ) : (
            <span className={styles.img} />
          )}
          {fromStep !== undefined && <span className={styles.from}>Del paso {fromStep}</span>}
          {req && variant !== 'mini' && (
            <span className={`${styles.req} ${styles[`req_${req.kind}`]}`}>{req.kind === 'story' ? 'Historia' : req.text}</span>
          )}
        </span>
        <span className={styles.name}>
          <span>{p ? personaName(p) : personaId}</span>
          {p && <small>Nv {p.level}</small>}
        </span>
      </Link>
      {note && <span className={styles.note}>{note}</span>}
      {(skills.length > 0 || learn.length > 0) && (
        <div className={styles.skills}>
          {skills.map((s) => (
            <span key={s} className={styles.chip}>{skillName(s)}</span>
          ))}
          {learn.map((l) => (
            <span key={l.skill} className={styles.learn} title={l.level ? `La aprende al subir al Nv ${l.level}` : 'La trae de base'}>
              {l.level ? `Nv ${l.level}` : 'Base'} · {skillName(l.skill)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
