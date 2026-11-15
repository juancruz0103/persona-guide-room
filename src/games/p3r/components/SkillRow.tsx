import { useState } from 'react';
import { elementColor, elementName, ailmentName } from '../data/elements';
import { getSkill, skillDescription, skillName } from '../services/text';
import { ElementIcon } from './ElementIcon';
import styles from './SkillRow.module.css';
import { L } from '../../../i18n';

/** Fila de habilidad con su descripción oficial al pasar el cursor (o al tocar en el celular). */
export function SkillRow({ name, right }: { name: string; right?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const info = getSkill(name);
  const desc = skillDescription(name);
  const color = info ? elementColor(info.element) : 'var(--c-line)';
  return (
    <li className={styles.row} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className={styles.main} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {info ? <ElementIcon el={info.element} size={24} title={false} /> : <span className={styles.dot} style={{ background: color }} aria-hidden="true" />}
        <span className={styles.name}>{skillName(name)}</span>
        {info?.cost && (
          <span className={info.cost.type === 'hp' ? styles.hp : styles.sp}>
            {info.cost.value}{info.cost.type === 'hp' ? L('% PS', '% HP') : L(' PE', ' SP')}
          </span>
        )}
        {right && <span className={styles.right}>{right}</span>}
      </button>
      {open && (desc || info) && (
        <div className={styles.tip} role="tooltip">
          {info && (
            <span className={styles.tipKind} style={{ color }}>
              {elementName(info.element)}
              {info.ailment ? ` · ${ailmentName(info.ailment)}` : ''}
            </span>
          )}
          <p>{desc ?? L('Sin descripción.', 'No description.')}</p>
        </div>
      )}
    </li>
  );
}
