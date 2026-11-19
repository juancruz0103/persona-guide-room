import { describe, expect, it } from 'vitest';
import { getFusionEngine } from './fusion';
import { getAllPersonas, getPartyPersonas } from './personas';

const byName = (n: string) => getAllPersonas().find((p) => p.name === n)!;

/** Diferencias con Royal que tienen que verse en la calculadora de P5 original. */
describe('Persona 5 original', () => {
  const e = getFusionEngine({ includeDlc: true, includeTreasure: true });
  it('210 Personas, sin las que agregó Royal', () => {
    expect(getAllPersonas()).toHaveLength(210);
    for (const n of ['Cait Sith', 'Vohu Manah', 'Maria', 'Raoul', 'Orpheus F']) expect(byName(n)).toBeUndefined();
  });
  it('sin Fe, Consejero ni Mundo', () => {
    expect(getAllPersonas().some((p) => ['faith', 'councillor', 'world'].includes(p.arcana))).toBe(false);
  });
  it('niveles del original (Ame-no-Uzume Nv 29, Andras Nv 10)', () => {
    expect(byName('Ame-no-Uzume').level).toBe(29);
    expect(byName('Andras').level).toBe(10);
  });
  it('Flauros = Berith + Andras + Eligor; Hell Biker sale por fusión normal', () => {
    expect(byName('Flauros').specialRecipe).toEqual(['Berith', 'Andras', 'Eligor']);
    expect(byName('Hell Biker').flags.special).toBe(false);
    expect(e.recipesFor(byName('Hell Biker')).length).toBeGreaterThan(0);
  });
  it('compañeros sin tercer semestre, sin Kasumi y Akechi solo con Robin Hood', () => {
    const party = getPartyPersonas();
    expect(party.some((p) => p.party?.stage === 'third' || p.party?.owner === 'kasumi')).toBe(false);
    expect(party.filter((p) => p.party?.owner === 'akechi').map((p) => p.name)).toEqual(['Robin Hood']);
  });
});
