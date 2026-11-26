import { elementColor, elementName } from '../data/elements';
import { getSkill, skillDescription, skillName } from '../services/text';
import styles from './SkillPeek.module.css';
import { L } from '../../../i18n';

/** Nombre de una skill que, al pasar el cursor (o tocarla), despliega qué hace: tipo, costo y descripción oficial. */
export function SkillPeek({ skill }: { skill: string }) {
  const s = getSkill(skill);
  const desc = skillDescription(skill);
  return (
    <span className={styles.peek}>
      <button type="button" className={styles.name}>{skillName(skill)}</button>
      <span className={styles.box} role="tooltip">
        <span className={styles.title}>{skillName(skill)}</span>
        {s && (
          <span className={styles.meta} style={{ color: elementColor(s.element) }}>
            {elementName(s.element)}
            {s.cost && <> · {s.cost.value}{s.cost.type === 'hp' ? L('% PS', '% HP') : L(' PE', ' SP')}</>}
          </span>
        )}
        <span className={styles.desc}>{desc ?? L('Sin descripción.', 'No description.')}</span>
      </span>
    </span>
  );
}
