import { describe, expect, it } from 'vitest';
import { getFusionEngine, P4R_PERSONAS } from '.';

const engine = getFusionEngine();
const byName = (n: string) => P4R_PERSONAS.find((p) => p.name === n)!;

describe('P4R fusion engine', () => {
  it('tiene las 226 Personas (205 + 21 de compañeros)', () => {
    expect(P4R_PERSONAS).toHaveLength(226);
    expect(P4R_PERSONAS.filter((p) => p.party)).toHaveLength(21);
  });

  it('usa los nombres oficiales del juego', () => {
    expect(byName('Pyro Jack').nameEs).toBe('Piro Jack');
    expect(byName('Hell Biker').nameEs).toBe('Ángel del infierno');
  });

  it('resuelve fusiones especiales de dos Personas', () => {
    const r = engine.fuse(byName('Rangda'), byName('Barong'));
    expect(r?.result.name).toBe('Shiva');
    expect(r?.kind).toBe('special');
  });

  it('no da como resultado Personas especiales ni de compañeros', () => {
    const list = engine.ingredients();
    for (let i = 0; i < list.length; i += 7)
      for (let j = i + 1; j < list.length; j += 5) {
        const r = engine.fuse(list[i], list[j]);
        if (r && r.kind !== 'special') {
          expect(r.result.flags.special).toBe(false);
          expect(r.result.party).toBeUndefined();
        }
      }
  });

  it('toda Persona normal se puede conseguir por fusión', () => {
    const normal = engine.ingredients().filter((p) => !p.flags.special && p.level > 1);
    const missing = normal.filter((p) => engine.recipesFor(p).length === 0).map((p) => p.name);
    expect(missing).toEqual([]);
  });
});
