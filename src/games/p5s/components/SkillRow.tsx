import { useState } from 'react';
import { ElementIcon } from '../../../shared/components/ElementIcon';
import { ELEMENTS } from '../../p5r/data/elements';
import { getSkill, skillDescription, skillName } from '../services/personas';
import styles from '../../p4g/components/SkillRow.module.css';
import { L } from '../../../i18n';

/** Fila de habilidad con su descripción al pasar el cursor (o al tocar en el celular). */
export function SkillRow({ name, right }: { name: string; right?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const info = getSkill(name);
  const desc = skillDescription(name);
  const el = info ? ELEMENTS[info.element] : undefined;
  return (
    <li className={styles.row} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className={styles.main} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {info ? <ElementIcon element={info.element} size={24} label={el?.name ?? ''} /> : <span className={styles.dot} aria-hidden="true" />}
        <span className={styles.name}>{skillName(name)}</span>
        {right && <span className={styles.right}>{right}</span>}
      </button>
      {open && info && (
        <div className={styles.tip} role="tooltip">
          <span className={styles.tipKind} style={{ color: el?.color }}>{el?.name}</span>
          <p>{desc ?? L('Sin descripción.', 'No description.')}</p>
        </div>
      )}
    </li>
  );
}
