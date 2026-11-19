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
  it('Abadón también sale de una fusión triple: Bugs + Lilit + Mot', () => {
    expect(e.recipesFor(getPersonaByName('Abaddon')!).map(names)).toContain('Bugs + Lilith + Mot');
  });
  it('Abadón y Thor tienen dos recetas', () => {
    expect(e.recipesFor(getPersonaByName('Abaddon')!)).toHaveLength(2);
    expect(e.recipesFor(getPersonaByName('Thor')!)).toHaveLength(2);
  });
});

import { canInherit, checkStep } from '../services/builds';
describe('builds de Strikers', () => {
  it('Dominio (Bendición) no hereda Eigaon (Maldición), visto en el juego', () => {
    expect(canInherit('dominion', 'Eigaon')).toBe(false);
    expect(canInherit('dominion', 'Mapsiodyne')).toBe(true);
  });
  it('valida la fusión triple de Abadón', () => {
    const ing = (persona: string) => ({ persona, skills: [] });
    expect(checkStep({ ingredients: ['bugs', 'lilith', 'mot'].map(ing), result: 'abaddon', inherit: [], learn: [] })).toBe('ok');
    expect(checkStep({ ingredients: ['bugs', 'mot'].map(ing), result: 'abaddon', inherit: [], learn: [] })).toBe('bad');
  });
});
