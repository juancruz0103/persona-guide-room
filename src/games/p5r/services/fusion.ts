import fusionJson from '../data/generated/fusion.json';
import { FusionEngine, type FusionData, type FusionOptions, type Recipe } from '../fusion/engine';
import { byPersonaName } from './gameText';
import { getAllPersonas } from './personas';

const DATA = fusionJson as unknown as FusionData;
const cache = new Map<string, FusionEngine>();

/** Devuelve un motor configurado con las opciones dadas (se reutiliza si ya existe). */
export function getFusionEngine(options: FusionOptions): FusionEngine {
  const key = `${options.includeDlc}-${options.includeTreasure}`;
  let engine = cache.get(key);
  if (!engine) {
    engine = new FusionEngine(getAllPersonas(), DATA, options);
    cache.set(key, engine);
  }
  return engine;
}

export const KIND_LABEL = {
  normal: 'Fusión normal',
  'same-arcana': 'Misma Arcana',
  treasure: 'Con Treasure Demon',
  'two-treasures': 'Dos Treasure Demons',
  special: 'Fusión especial',
} as const;

/* ---------- Orden de la tabla «¿Cómo consigo una Persona?» ---------- */

export type RecipeSortKey = 'a' | 'b' | 'levels';
export interface RecipeSort {
  key: RecipeSortKey;
  dir: 'asc' | 'desc';
}

/**
 * Ordena una COPIA de las recetas (no cambia qué combinaciones salen).
 * Ingredientes: por nombre en español. Niveles: por la suma de los dos niveles.
 * Sin orden elegido se respeta el del motor (primero las normales).
 */
export function sortRecipes(recipes: Recipe[], sort: RecipeSort | null): Recipe[] {
  if (!sort) return recipes;
  const cmp: Record<RecipeSortKey, (x: Recipe, y: Recipe) => number> = {
    a: (x, y) => byPersonaName(x.a, y.a) || byPersonaName(x.b, y.b),
    b: (x, y) => byPersonaName(x.b, y.b) || byPersonaName(x.a, y.a),
    levels: (x, y) =>
      x.a.level + x.b.level - (y.a.level + y.b.level) ||
      Math.max(x.a.level, x.b.level) - Math.max(y.a.level, y.b.level),
  };
  const sign = sort.dir === 'asc' ? 1 : -1;
  return [...recipes].sort((x, y) => sign * cmp[sort.key](x, y));
}
