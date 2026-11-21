import { L } from '../../i18n';
import { nextSort, type RecipeSort, type RecipeSortKey } from '../recipeSort';
import styles from './RecipeSortBar.module.css';

/** Botones para ordenar una lista de combinaciones sin separar los pares (ver recipeSort.ts). */
export function RecipeSortBar({ sort, onChange }: { sort: RecipeSort | null; onChange: (s: RecipeSort | null) => void }) {
  const btn = (key: RecipeSortKey, label: string, hint: string) => {
    const active = sort?.key === key;
    return (
      <button type="button" className={`${styles.btn} ${active ? styles.active : ''}`} onClick={() => onChange(nextSort(sort, key))} title={hint}
        aria-pressed={active}>
        {label}
        <span aria-hidden="true" className={styles.arrow}>{active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    );
  };
  return (
    <div className={styles.bar} role="group" aria-label={L('Ordenar combinaciones', 'Sort combinations')}>
      <span className={styles.label}>{L('Ordenar:', 'Sort:')}</span>
      {btn('a', L('Ingrediente 1 (A-Z)', 'Ingredient 1 (A-Z)'), L('Ordenar por el nombre del primer ingrediente', 'Sort by the first ingredient name'))}
      {btn('b', L('Ingrediente 2 (A-Z)', 'Ingredient 2 (A-Z)'), L('Ordenar por el nombre del segundo ingrediente', 'Sort by the second ingredient name'))}
      {btn('levels', L('Nivel', 'Level'), L('Ordenar por nivel (de menor a mayor)', 'Sort by level (low to high)'))}
    </div>
  );
}
