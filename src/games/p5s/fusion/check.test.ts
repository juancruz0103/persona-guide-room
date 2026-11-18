import { describe, expect, it } from 'vitest';
import { getFusionEngine } from '.';
import { getPersonaByName } from '../services/personas';

const names = (r: { ingredients: { persona: { name: string } }[] }) => r.ingredients.map((i) => i.persona.name).sort().join(' + ');

/** Casos vistos en el juego (Velvet Room de Strikers). */
describe('fusión de Strikers', () => {
  const e = getFusionEngine();
  it('Andras = Silky + Mokoi', () => {
    expect(e.recipesFor(getPersonaByName('Andras')!).map(names)).toContain('Mokoi + Silky');
  });
  it('Dominio tiene Forneus + Mot y Metatrón + Rey Frost', () => {
    const r = e.recipesFor(getPersonaByName('Dominion')!).map(names);
    expect(r).toContain('Forneus + Mot');
    expect(r).toContain('King Frost + Metatron');
  });
  it('Abadón y Thor tienen dos recetas', () => {
    expect(e.recipesFor(getPersonaByName('Abaddon')!)).toHaveLength(2);
    expect(e.recipesFor(getPersonaByName('Thor')!)).toHaveLength(2);
  });
});
