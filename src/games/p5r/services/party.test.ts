import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterPersonas, getAllPersonas, getCatalogPersonas, getPartyPersonas, getPersona } from './personas';
import { getFusionEngine } from './fusion';
import { personaMyth, personaName } from './gameText';

describe('Personas de los compañeros', () => {
  it('hay 3 formas para cada uno de los 9 compañeros', () => {
    const party = getPartyPersonas();
    expect(party).toHaveLength(27);
    for (const stage of ['initial', 'evolved', 'third']) {
      expect(party.filter((p) => p.party!.stage === stage)).toHaveLength(9);
    }
  });

  it('no entran en la fusión', () => {
    const fusable = new Set(getAllPersonas().map((p) => p.id));
    for (const p of getPartyPersonas()) expect(fusable.has(p.id), p.id).toBe(false);
    const engine = getFusionEngine({ includeDlc: true, includeTreasure: true });
    const kidd = getPersona('captain-kidd')!;
    expect(engine.recipesFor(kidd)).toHaveLength(0);
  });

  it('la evolución gana una skill y cambia afinidades; el tercer semestre gana otra y un rasgo', () => {
    const kidd = getPersona('captain-kidd')!;
    const seiten = getPersona('seiten-taisei')!;
    const william = getPersona('william')!;
    expect(seiten.skills!.length).toBe(kidd.skills!.length + 1);
    expect(seiten.skills![seiten.skills!.length - 1]).toEqual({ skill: 'Evade Wind', level: null, note: 'Al evolucionar' });
    expect(seiten.resistances.ele).toBe('null');
    expect(kidd.resistances.ele).toBe('resist');
    expect(william.skills!.length).toBe(seiten.skills!.length + 1);
    expect(william.trait).toBe('Eccentric Temper');
    expect(personaName(seiten)).toBe('Seiten Taisei');
    expect(personaName(getPersona('hecate')!)).toBe('Hécate');
  });

  it('Futaba aprende skills por rango de confidente', () => {
    const necro = getPersona('necronomicon')!;
    expect(necro.skills!.find((s) => s.skill === 'Position Hack')?.note).toBe('Rango 4');
  });

  it('el catálogo muestra las iniciales; evolucionadas y tercer semestre solo con su filtro', () => {
    const all = getCatalogPersonas();
    const ids = (f = DEFAULT_FILTERS) => filterPersonas(all, f).map((p) => p.id);
    expect(ids()).toContain('captain-kidd');
    expect(ids()).not.toContain('seiten-taisei');
    const withSpoilers = ids({ ...DEFAULT_FILTERS, partyEvolved: true, partyThird: true });
    expect(withSpoilers).toContain('seiten-taisei');
    expect(withSpoilers).toContain('william');
  });

  it('todas las Personas tienen su origen', () => {
    for (const p of getCatalogPersonas()) expect(personaMyth(p), p.name).toBeTruthy();
  });
});
