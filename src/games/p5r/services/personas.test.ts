import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterPersonas, getAllPersonas, getPersona } from './personas';

const all = getAllPersonas();

describe('filterPersonas', () => {
  it('devuelve todo con los filtros por defecto, ordenado por nivel', () => {
    const r = filterPersonas(all, DEFAULT_FILTERS);
    expect(r).toHaveLength(all.length);
    const levels = r.map((p) => p.level);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
  });

  it('busca por nombre sin importar mayúsculas', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, query: 'aLiC' });
    expect(r.map((p) => p.name)).toEqual(['Alice']);
  });

  it('excluye las Personas DLC cuando se desactiva la opción', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, includeDlc: false });
    expect(r.some((p) => p.flags.dlc)).toBe(false);
    expect(r.length).toBe(all.length - all.filter((p) => p.flags.dlc).length);
  });

  it('filtra por Arcana y rango de nivel', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, arcanas: ['justice'], minLevel: 10 });
    expect(r.map((p) => p.name)).toEqual(['Archangel']);
  });

  it('ordena alfabéticamente', () => {
    const r = filterPersonas(all, { ...DEFAULT_FILTERS, sort: 'name-asc' });
    expect(r[0].name).toBe('Abaddon');
  });
});

describe('datos de muestra', () => {
  it('Abaddon coincide con la fuente (aqiu384, P5R)', () => {
    const a = getPersona('abaddon')!;
    expect(a.level).toBe(75);
    expect(a.arcana).toBe('judgement');
    expect(a.resistances.phy).toBe('drain');
    expect(a.resistances.ble).toBe('resist');
    expect(a.skills).toHaveLength(7);
  });
});
