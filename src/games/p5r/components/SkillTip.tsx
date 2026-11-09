import { useId } from 'react';
import { ElementIcon } from '../../../shared/components/ElementIcon';
import { ELEMENTS } from '../data/elements';
import { ailmentText, describeCost, techText } from '../services/skillText';
import type { SkillInfo } from '../types';
import styles from './SkillTip.module.css';

/**
 * Ícono del elemento de una skill. Al pasar el mouse (o tocarlo) muestra
 * qué hace el elemento, el costo (HP en verde, SP en violeta) y el Técnico.
 */
export function SkillTip({ skill, size = 28 }: { skill: SkillInfo | undefined; size?: number }) {
  const tipId = useId();
  const el = skill && skill.element !== 'tra' ? ELEMENTS[skill.element] : null;
  if (!skill || !el) {
    return (
      <span className={styles.icon} aria-hidden="true">
        ?
      </span>
    );
  }
  const cost = describeCost(skill);

  return (
    <span className={styles.wrap}>
      <button type="button" className={styles.icon} aria-label={`Elemento: ${el.name}`} aria-describedby={tipId}>
        <ElementIcon element={el.id} size={size} />
      </button>
      <span role="tooltip" id={tipId} className={styles.tip} style={{ borderLeftColor: el.color }}>
        <span className={styles.title}>{el.name}</span>
        <span className={styles.text}>{el.description}</span>
        {cost && (
          <span className={styles.text}>
            <strong>Costo:</strong> <strong className={cost.kind === 'hp' ? 'cost-hp-dark' : 'cost-sp-dark'}>{cost.text}</strong>
          </span>
        )}
        {skill.ailment && (
          <span className={styles.ailment}>
            <span>
              <strong>Puede causar:</strong> {ailmentText(skill)}
            </span>
            <span>
              <strong className={styles.tech}>Técnico con:</strong> {techText(skill)}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}
