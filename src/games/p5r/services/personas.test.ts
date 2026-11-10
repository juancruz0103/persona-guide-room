import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterPersonas, getAllPersonas, getCatalogPersonas, getPersona, getSkill } from './personas';

const all = getAllPersonas();

describe('filterPersonas', () => {
  it('devuelve las 232 con los filtros por defecto, ordenadas por nivel', () => {
    const r = filterPersonas(all, DEFAULT_FILTERS);
    expect(r).toHaveLength(232);
    const levels = r.map((p) => p.level);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
  });

  it('busca por nombre sin importar mayúsculas', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, query: 'aLiC' });
    expect(r.map((p) => p.name)).toEqual(['Alice']);
  });

  it('excluye DLC y Treasure Demons cuando se desactivan', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, includeDlc: false, includeTreasure: false });
    expect(r).toHaveLength(232 - 25 - 9);
    expect(r.some((p) => p.flags.dlc || p.flags.treasure)).toBe(false);
  });

  it('filtra por Arcana y rango de nivel', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, arcanas: ['justice'], maxLevel: 14 });
    expect(r.map((p) => p.name)).toEqual(['Angel', 'Archangel']);
  });

  it('ordena alfabéticamente', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, sort: 'name-asc' });
    expect(r[0].name).toBe('Abaddon');
  });
});

describe('datos del compendio', () => {
  it('Abaddon coincide con la fuente (aqiu384, P5R)', () => {
    const a = getPersona('abaddon')!;
    expect(a.level).toBe(75);
    expect(a.arcana).toBe('judgement');
    expect(a.resistances.phy).toBe('drain');
    expect(a.resistances.ble).toBe('resist');
    expect(a.stats).toEqual({ st: 51, ma: 42, en: 58, ag: 38, lu: 43 });
    expect(a.skills).toHaveLength(7);
    expect(a.skills![0]).toEqual({ skill: 'Mabufudyne', level: null });
  });

  it('todas las skills de las Personas tienen datos', () => {
    for (const p of all) for (const s of p.skills ?? []) expect(getSkill(s.skill), `${p.name}: ${s.skill}`).toBeTruthy();
  });

  it('Mabufudyne puede congelar y Flash Bomb marear', () => {
    expect(getSkill('Mabufudyne')).toMatchObject({ element: 'ice', ailment: 'freeze', target: 'all' });
    expect(getSkill('Flash Bomb')).toMatchObject({ element: 'phy', ailment: 'dizzy' });
  });
});

describe('filtro «solo compañeros»', () => {
  it('muestra solo Personas de compañeros y respeta las formas elegidas', () => {
    const catalog = getCatalogPersonas();
    const only = filterPersonas(catalog, { ...DEFAULT_FILTERS, partyOnly: true });
    expect(only.length).toBeGreaterThan(0);
    expect(only.every((p) => p.party?.stage === 'initial')).toBe(true);
    const allForms = filterPersonas(catalog, { ...DEFAULT_FILTERS, partyOnly: true, partyEvolved: true, partyThird: true });
    expect(allForms.every((p) => p.party)).toBe(true);
    expect(new Set(allForms.map((p) => p.party!.stage))).toEqual(new Set(['initial', 'evolved', 'third']));
    const thirdOnly = filterPersonas(catalog, { ...DEFAULT_FILTERS, partyOnly: true, partyInitial: false, partyThird: true });
    expect(thirdOnly.every((p) => p.party!.stage === 'third')).toBe(true);
  });
});
