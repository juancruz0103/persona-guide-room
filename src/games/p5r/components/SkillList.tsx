import type { PersonaSkill } from '../types';
import { getSkill } from '../services/personas';
import { TARGET_LABEL, describeCost } from '../services/skillText';
import { SkillTip } from './SkillTip';
import styles from './SkillList.module.css';
import { skillName, skillNameEn } from '../services/gameText';

function SkillRow({ entry }: { entry: PersonaSkill }) {
  const info = getSkill(entry.skill);
  const initial = entry.level === null;
  const cost = info ? describeCost(info) : undefined;

  return (
    <li className={`${styles.row} ${initial ? styles.initial : styles.learned}`}>
      <span className={styles.when}>{initial ? 'Inicial' : `Nv ${entry.level}`}</span>
      <SkillTip skill={info} />
      <span className={styles.name} title={`En inglés: ${skillNameEn(entry.skill)}`}>
        {skillName(entry.skill)}
      </span>
      {cost && <span className={`${styles.cost} ${cost.kind === 'hp' ? 'cost-hp' : 'cost-sp'}`}>{cost.text}</span>}
      {info?.target && info.element !== 'pas' && <span className={styles.target}>{TARGET_LABEL[info.target]}</span>}
    </li>
  );
}

export function SkillList({ skills }: { skills: PersonaSkill[] }) {
  return (
    <>
      <ul className={styles.list}>
        {skills.map((s) => (
          <SkillRow key={s.skill} entry={s} />
        ))}
      </ul>
      <p className={styles.help}>
        Pasá el mouse (o tocá) el ícono para ver qué hace el elemento, cuánto cuesta y, si provoca un estado, con
        qué elementos hacés un Técnico. Costo: <strong className="cost-hp">HP</strong> /{' '}
        <strong className="cost-sp">SP</strong>.
      </p>
    </>
  );
}
