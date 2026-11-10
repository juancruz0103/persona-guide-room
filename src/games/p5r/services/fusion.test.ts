import { describe, expect, it } from 'vitest';
import { getFusionEngine, sortRecipes } from './fusion';
import { getAllPersonas } from './personas';
import { personaName } from './gameText';

const engine = getFusionEngine({ includeDlc: true, includeTreasure: true });
const target = getAllPersonas().find((p) => p.name === 'Oberon')!;
const recipes = engine.recipesFor(target);
const key = (r: (typeof recipes)[number]) => `${r.a.id}+${r.b.id}`;
const collator = new Intl.Collator('es', { ignorePunctuation: true });

describe('orden de «¿Cómo consigo una Persona?»', () => {
  it('ordenar no agrega ni quita combinaciones, y no toca la lista original', () => {
    const before = recipes.map(key);
    for (const s of [
      { key: 'a', dir: 'asc' },
      { key: 'b', dir: 'desc' },
      { key: 'levels', dir: 'asc' },
    ] as const) {
      const sorted = sortRecipes(recipes, s);
      expect(sorted.map(key).sort()).toEqual([...before].sort());
    }
    expect(recipes.map(key)).toEqual(before);
  });

  it('sin orden elegido respeta el del motor', () => {
    expect(sortRecipes(recipes, null)).toBe(recipes);
  });

  it('ingrediente 1 de la A a la Z y al revés', () => {
    const asc = sortRecipes(recipes, { key: 'a', dir: 'asc' }).map((r) => personaName(r.a));
    for (let i = 1; i < asc.length; i++) expect(collator.compare(asc[i - 1], asc[i])).toBeLessThanOrEqual(0);
    const desc = sortRecipes(recipes, { key: 'a', dir: 'desc' }).map((r) => personaName(r.a));
    expect(desc[0]).toBe(asc[asc.length - 1]);
  });

  it('niveles: de la suma más baja a la más alta', () => {
    const sums = sortRecipes(recipes, { key: 'levels', dir: 'asc' }).map((r) => r.a.level + r.b.level);
    for (let i = 1; i < sums.length; i++) expect(sums[i - 1]).toBeLessThanOrEqual(sums[i]);
  });
});
