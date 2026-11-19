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

describe('reemplazo por la misma Arcana', () => {
  it('Fortuna + Hua Po (Ahorcado, subida a Nv 46) da Lilit, visto en el juego', () => {
    const ing = (persona: string) => ({ persona, skills: [] });
    expect(checkStep({ ingredients: ['fortuna', 'hua-po'].map(ing), result: 'lilith', inherit: [], learn: [] })).toBe('ok');
  });
});

describe('recetas vistas en el video', () => {
  it('Cerbero = Thor + Yatagarasu (además de la especial Ortro + Raja Naga)', () => {
    const ing = (persona: string) => ({ persona, skills: [] });
    expect(checkStep({ ingredients: ['yatagarasu', 'thor'].map(ing), result: 'cerberus', inherit: [], learn: [] })).toBe('ok');
    expect(checkStep({ ingredients: ['orthrus', 'raja-naga'].map(ing), result: 'cerberus', inherit: [], learn: [] })).toBe('ok');
  });
});

/** Ruta completa a Lucifer según guías (GameRevolution, TouchTapPlay, Samurai Gamers) y un artículo de builds en Medium. */
describe('ruta de guía a Lucifer', () => {
  const id = (n: string) => getPersonaByName(n)!.id;
  const step = (res: string, ...ings: string[]) => ({ ingredients: ings.map((n) => ({ persona: id(n), skills: [] })), result: id(res), inherit: [], learn: [] });
  it.each([
    ['Seth', 'Mithras', 'Koppa Tengu'], ['Thor', 'Trumpeter', 'Nebiros'], ['Siegfried', 'Seth', 'Thor'],
    ['Yatagarasu', 'Kurama Tengu', 'Seth'], ['Yoshitsune', 'Siegfried', 'Arahabaki', 'Okuninushi', 'Yatagarasu'],
    ['Nebiros', 'Silky', 'Mitra'], ['Nebiros', 'Kikuri-Hime', 'Koppa Tengu'], ['Nebiros', 'Sarasvati', 'Raja Naga'],
    ['Alice', 'Nebiros', 'Lilith', 'Bugs', 'Dominion'], ['Metatron', 'Archangel', 'Principality', 'Trumpeter', 'Dominion'],
    ['Black Frost', "Jack-o'-Lantern", 'King Frost', 'Jack Frost'], ['Mara', 'Cerberus', 'Kali', 'Abaddon'],
    ['Lucifer', 'Black Frost', 'Mara', 'Metatron', 'Alice', 'Yoshitsune'],
  ])('%s', (res, ...ings) => expect(checkStep(step(res, ...ings))).toBe('ok'));
  it('Yoshitsune no hereda magia (Wild Thunder), Metatrón sí hereda Mahamaon', () => {
    expect(canInherit('yoshitsune', 'Wild Thunder')).toBe(false);
    expect(canInherit('metatron', 'Mahamaon')).toBe(true);
  });
});
