import { describe, expect, it } from 'vitest';
import { getFusionEngine, P3R_PERSONAS } from './index';

const byName = (n: string) => P3R_PERSONAS.find((p) => p.name === n)!;
const engine = getFusionEngine({ includeDlc: true });
const noDlc = getFusionEngine({ includeDlc: false });

describe('datos de P3R', () => {
  it('194 Personas fusionables + 9 de compañeros, sin Episode Aigis', () => {
    expect(P3R_PERSONAS.filter((p) => !p.party)).toHaveLength(194);
    expect(P3R_PERSONAS.filter((p) => p.party)).toHaveLength(9);
  });
  it('todas tienen nombre oficial en español', () => {
    expect(P3R_PERSONAS.filter((p) => !p.nameEs).map((p) => p.name)).toEqual([]);
    expect(byName('Orpheus').nameEs).toBe('Orfeo');
  });
  it('afinidades de Reload: 3 físicos y sin psi/nuclear', () => {
    expect(Object.keys(byName('Orpheus').resistances)).toEqual(['sla', 'str', 'pie', 'fir', 'ice', 'ele', 'win', 'lig', 'dar', 'alm']);
  });
});

describe('motor de fusiones de P3R', () => {
  it('es simétrico', () => {
    const list = engine.ingredients().slice(0, 60);
    for (const a of list) for (const b of list) {
      expect(engine.fuse(a, b)?.result.id).toBe(engine.fuse(b, a)?.result.id);
    }
  });
  it('nunca devuelve uno de los ingredientes', () => {
    const list = engine.ingredients();
    for (let i = 0; i < list.length; i += 3) for (let j = 0; j < list.length; j += 5) {
      const r = engine.fuse(list[i], list[j]);
      if (r) expect([list[i].id, list[j].id]).not.toContain(r.result.id);
    }
  });
  it('la búsqueda inversa coincide con fuse()', () => {
    const target = byName('Unicorn');
    const recipes = engine.recipesFor(target);
    expect(recipes.length).toBeGreaterThan(0);
    for (const r of recipes) expect(engine.fuse(r.a, r.b)?.result.name).toBe('Unicorn');
  });
  it('fusiones especiales de 2 ingredientes', () => {
    expect(engine.fuse(byName('Rangda'), byName('Barong'))?.result.name).toBe('Shiva');
    expect(engine.fuse(byName('Orpheus'), byName('Thanatos'))?.result.name).toBe('Messiah');
  });
  it('las especiales no salen de fusiones normales', () => {
    const shiva = byName('Shiva');
    expect(engine.recipesFor(shiva).every((r) => r.kind === 'special')).toBe(true);
  });
  it('sin DLC no aparecen las Personas de los packs', () => {
    expect(noDlc.ingredients().some((p) => p.flags.dlc)).toBe(false);
    expect(engine.ingredients().some((p) => p.name === 'Izanagi')).toBe(true);
  });
  it('Orfeo Telos usa 6 ingredientes', () => {
    expect(engine.specialRecipe(byName('Orpheus Telos'))).toHaveLength(6);
  });
});
