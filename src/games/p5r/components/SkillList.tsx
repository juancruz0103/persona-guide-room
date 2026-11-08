import { useId } from 'react';
import { ElementIcon } from '../../../shared/components/ElementIcon';
import type { PersonaSkill } from '../types';
import { AILMENTS, ELEMENTS, technicalFor } from '../data/elements';
import { getSkill } from '../services/personas';
import styles from './SkillList.module.css';

const TARGET_LABEL = { one: '1 enemigo', all: 'Todos', self: 'Uno mismo', party: 'Grupo' } as const;

function techText(ailment: keyof typeof AILMENTS): string {
  const rule = technicalFor(ailment);
  if (!rule) return '';
  if (rule.base.includes('any')) return 'cualquier elemento';
  const names = rule.base.map((e) => ELEMENTS[e as keyof typeof ELEMENTS].name);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} o ${names[names.length - 1]}` : names[0];
}

function SkillRow({ entry }: { entry: PersonaSkill }) {
  const tipId = useId();
  const info = getSkill(entry.skill);
  const initial = entry.level === null;
  const el = info ? ELEMENTS[info.element] : null;

  return (
    <li className={`${styles.row} ${initial ? styles.initial : styles.learned}`}>
      <span className={styles.when}>{initial ? 'Inicial' : `Nv ${entry.level}`}</span>

      {el && info ? (
        <span className={styles.tipWrap}>
          <button
            type="button"
            className={styles.icon}
            aria-label={`Elemento: ${el.name}`}
            aria-describedby={tipId}
          >
            <ElementIcon element={info.element} size={28} />
          </button>
          <span role="tooltip" id={tipId} className={styles.tip} style={{ borderLeftColor: el.color }}>
            <span className={styles.tipTitle}>{el.name}</span>
            <span className={styles.tipText}>{el.description}</span>
            {info.ailment && (
              <span className={styles.tipAilment}>
                <span><strong>Puede causar:</strong> {AILMENTS[info.ailment].es} ({AILMENTS[info.ailment].en})</span>
                <span><strong className={styles.tech}>Técnico con:</strong> {techText(info.ailment)}</span>
              </span>
            )}
          </span>
        </span>
      ) : (
        <span className={styles.icon} aria-hidden="true">?</span>
      )}

      <span className={styles.name}>{entry.skill}</span>
      {info?.target && <span className={styles.target}>{TARGET_LABEL[info.target]}</span>}
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
        Pasá el mouse (o tocá) el ícono para ver qué hace el elemento y, si provoca un estado, con qué
        elementos hacés un Técnico.
      </p>
    </>
  );
}
