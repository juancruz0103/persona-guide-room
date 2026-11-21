/**
 * Orden de las listas de combinaciones (igual que en la calculadora de Royal):
 * por el nombre del ingrediente 1, del ingrediente 2 o por nivel. Se ordena una COPIA y cada
 * combinación se mueve entera, así que los pares nunca se separan.
 */
export type RecipeSortKey = 'a' | 'b' | 'levels';
export interface RecipeSort {
  key: RecipeSortKey;
  dir: 'asc' | 'desc';
}
export interface SortSide {
  name: string;
  level: number;
}

/** Cada clic: A-Z → Z-A → orden recomendado */
export const nextSort = (s: RecipeSort | null, key: RecipeSortKey): RecipeSort | null =>
  s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null;

const byName = (x: SortSide, y: SortSide) => x.name.localeCompare(y.name, 'es', { sensitivity: 'base' });

/**
 * `sides` devuelve los dos ingredientes de una combinación, o null si no es de a dos
 * (fusiones especiales): esas quedan al final, en su orden original.
 */
export function sortRecipes<T>(items: T[], sort: RecipeSort | null, sides: (item: T) => [SortSide, SortSide] | null): T[] {
  if (!sort) return items;
  const pairs = items.map((item, i) => ({ item, i, s: sides(item) }));
  const sign = sort.dir === 'asc' ? 1 : -1;
  const cmp = (x: [SortSide, SortSide], y: [SortSide, SortSide]) => {
    if (sort.key === 'a') return byName(x[0], y[0]) || byName(x[1], y[1]);
    if (sort.key === 'b') return byName(x[1], y[1]) || byName(x[0], y[0]);
    return x[0].level + x[1].level - (y[0].level + y[1].level) || Math.max(x[0].level, x[1].level) - Math.max(y[0].level, y[1].level);
  };
  return pairs
    .sort((x, y) => {
      if (!x.s || !y.s) return (x.s ? 0 : 1) - (y.s ? 0 : 1) || x.i - y.i;
      return sign * cmp(x.s, y.s) || x.i - y.i;
    })
    .map((p) => p.item);
}
