import { Link } from 'react-router-dom';
import { getPersona } from '../services/personas';
import { personaName, skillName } from '../services/gameText';
import { personaCardFocus, personaImage } from '../services/images';
import styles from './BuildPersona.module.css';

interface Props {
  personaId: string;
  skills: string[];
  /** Resaltar como resultado de la fusión */
  result?: boolean;
  /** Texto en lugar de la lista de habilidades (p. ej. «3 heredadas») */
  skillsLabel?: string;
}

/** Tarjeta de una Persona dentro de una build: foto, nombre y habilidades que pasa. Lleva a su perfil. */
export function BuildPersona({ personaId, skills, result, skillsLabel }: Props) {
  const p = getPersona(personaId);
  const img = personaImage(personaId, 'side');
  return (
    <div className={`${styles.card} ${result ? styles.result : ''}`}>
      <Link to={`/p5r/calculadora/persona/${personaId}`} className={styles.head} title="Ver perfil de la Persona">
        {img ? (
          <img src={img} alt="" className={styles.img} style={{ objectPosition: personaCardFocus(personaId) }} />
        ) : (
          <span className={styles.img} />
        )}
        <span className={styles.name}>
          {p ? personaName(p) : personaId}
          {p && <span className={styles.lvl}>Nv {p.level}</span>}
        </span>
      </Link>
      {skillsLabel ? (
        <div className={styles.skills}>
          <span className={styles.chip}>{skillsLabel}</span>
        </div>
      ) : (
        skills.length > 0 && (
          <div className={styles.skills}>
            {skills.map((s) => (
              <span key={s} className={styles.chip}>{skillName(s)}</span>
            ))}
          </div>
        )
      )}
    </div>
  );
}
