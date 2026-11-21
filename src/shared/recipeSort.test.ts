import { describe, expect, it } from 'vitest';
import { nextSort, sortRecipes } from './recipeSort';

type R = { a: string; b: string; la: number; lb: number } | { special: true };
const rs: R[] = [
  { a: 'Setanta', b: 'Samael', la: 29, lb: 41 },
  { a: 'Kaguya', b: 'Cendrillon', la: 34, lb: 36 },
  { special: true },
  { a: 'Eligor', b: 'Dominio', la: 31, lb: 42 },
];
const sides = (r: R) => ('special' in r ? null : ([{ name: r.a, level: r.la }, { name: r.b, level: r.lb }] as [{ name: string; level: number }, { name: string; level: number }]));
const names = (x: R[]) => x.map((r) => ('special' in r ? '*' : `${r.a}+${r.b}`));

describe('orden de combinaciones', () => {
  it('ordena por ingrediente sin separar los pares', () => {
    expect(names(sortRecipes(rs, { key: 'a', dir: 'asc' }, sides))).toEqual(['Eligor+Dominio', 'Kaguya+Cendrillon', 'Setanta+Samael', '*']);
    expect(names(sortRecipes(rs, { key: 'b', dir: 'asc' }, sides))).toEqual(['Kaguya+Cendrillon', 'Eligor+Dominio', 'Setanta+Samael', '*']);
    expect(names(sortRecipes(rs, { key: 'a', dir: 'desc' }, sides))).toEqual(['Setanta+Samael', 'Kaguya+Cendrillon', 'Eligor+Dominio', '*']);
  });
  it('por nivel suma los dos', () => {
    expect(names(sortRecipes(rs, { key: 'levels', dir: 'asc' }, sides))).toEqual(['Kaguya+Cendrillon', 'Setanta+Samael', 'Eligor+Dominio', '*']);
  });
  it('sin orden deja el recomendado y el tercer clic vuelve a él', () => {
    expect(sortRecipes(rs, null, sides)).toBe(rs);
    expect(nextSort(nextSort(nextSort(null, 'a'), 'a'), 'a')).toBeNull();
  });
});
