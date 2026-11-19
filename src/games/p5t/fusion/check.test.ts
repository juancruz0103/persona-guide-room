import { describe, expect, it } from 'vitest';
import { getFusionEngine } from '.';
import { getAllPersonas } from '../services/personas';

const byEn = (n: string) => getAllPersonas().find((p) => p.nameEn === n)!;
const names = (r: { ingredients: { nameEn: string }[] }) => r.ingredients.map((p) => p.nameEn).sort().join(' + ');

describe('fusión de Tactica', () => {
  const e = getFusionEngine();
  it('hay 219 Personas y 22 fusiones especiales', () => {
    expect(getAllPersonas()).toHaveLength(219);
    expect(getAllPersonas().filter((p) => p.special)).toHaveLength(22);
  });
  it('Principado = Jikokuten + Matador (guías)', () => {
    expect(e.fuse(byEn('Jikokuten'), byEn('Matador'))?.nameEn).toBe('Principality');
  });
  it('Ardha = Parvati + Shiva (especial)', () => {
    expect(e.resultOf([byEn('Parvati'), byEn('Shiva')])?.nameEn).toBe('Ardha');
    expect(e.recipesFor(byEn('Ardha')).map(names)).toEqual(['Parvati + Shiva']);
  });
  it('las de «solo especial» no salen por fusión normal', () => {
    for (const p of getAllPersonas().filter((x) => !x.normalFusion && !x.special)) expect(e.recipesFor(p)).toEqual([]);
  });
  it('sin DLC no aparecen los Pícaros', () => {
    const noDlc = getFusionEngine(false);
    expect(noDlc.recipesFor(byEn('Athena Picaro'))).toEqual([]);
    expect(e.recipesFor(byEn('Athena Picaro')).length).toBeGreaterThan(0);
  });
  it('mismo tipo da una Persona más baja', () => {
    const r = e.fuse(byEn('Jack Frost'), byEn('King Frost'));
    expect(r?.type).toBe('freeze');
    expect(r!.level).toBeLessThan(byEn('King Frost').level);
  });
});
