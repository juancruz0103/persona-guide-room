import { ElementIcon } from '../../../shared/components/ElementIcon';
import type { Affinity, ResistElement } from '../types';
import { AFFINITY_LABEL, ELEMENTS, RESIST_ORDER } from '../data/elements';
import styles from './AffinityGrid.module.css';

const LEGEND: Affinity[] = ['weak', 'resist', 'null', 'repel', 'drain', 'neutral'];

/** Grilla de afinidades: ícono del elemento + resultado. */
export function AffinityGrid({ resistances }: { resistances: Record<ResistElement, Affinity> }) {
  return (
    <>
      <ul className={styles.grid}>
        {RESIST_ORDER.map((el) => {
          const aff = resistances[el];
          const name = ELEMENTS[el].name;
          return (
            <li key={el} className={styles.cell} title={`${name}: ${AFFINITY_LABEL[aff]}`}>
              <ElementIcon element={el} size={44} label={name} />
              <span className={`${styles.value} ${styles[aff]}`}>
                {AFFINITY_LABEL[aff]}
                {aff === 'neutral' && <span className="sr-only"> (neutral)</span>}
              </span>
            </li>
          );
        })}
      </ul>
      <div className={styles.legend}>
        {LEGEND.map((a) => (
          <span key={a} className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles[a]}`} aria-hidden="true" />
            {a === 'neutral' ? 'Neutral' : AFFINITY_LABEL[a]}
          </span>
        ))}
        <span>· Pasá el mouse sobre un ícono para ver el nombre del elemento.</span>
      </div>
    </>
  );
}
