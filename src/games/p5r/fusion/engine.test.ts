import { describe, expect, it } from 'vitest';
import personasJson from '../data/generated/personas.json';
import fusionJson from '../data/generated/fusion.json';
import type { ArcanaId, Persona } from '../types';
import { FusionEngine, type FusionData } from './engine';

const PERSONAS = personasJson as unknown as Persona[];
const DATA = fusionJson as unknown as FusionData;
const ALL_ON = { includeDlc: true, includeTreasure: true };

const byName = new Map(PERSONAS.map((p) => [p.name, p]));
const P = (name: string) => {
  const p = byName.get(name);
  if (!p) throw new Error(`No existe: ${name}`);
  return p;
};

/* ------------------------------------------------------------------ */
/* Datos importados                                                    */
/* ------------------------------------------------------------------ */

describe('datos importados (aqiu384, P5R)', () => {
  it('tiene 232 Personas, 9 Treasure Demons, 25 DLC y 24 especiales', () => {
    expect(PERSONAS).toHaveLength(232);
    expect(PERSONAS.filter((p) => p.flags.treasure)).toHaveLength(9);
    expect(PERSONAS.filter((p) => p.flags.dlc)).toHaveLength(25);
    expect(PERSONAS.filter((p) => p.flags.special)).toHaveLength(24);
  });

  it('la tabla de Arcanas es simétrica y cubre todas las combinaciones distintas', () => {
    const arcanas = DATA.arcanaOrder;
    let missing = 0;
    for (const a of arcanas)
      for (const b of arcanas) {
        if (a === b) continue;
        const r1 = DATA.chart[a]?.[b];
        expect(r1).toBe(DATA.chart[b]?.[a]);
        if (!r1) missing++;
      }
    // Algunas combinaciones no producen resultado en el juego; deben ser pocas.
    expect(missing).toBeLessThan(arcanas.length * 4);
  });

  it('los ingredientes de las recetas especiales existen', () => {
    for (const ingredients of Object.values(DATA.specialRecipes))
      for (const name of ingredients) expect(byName.has(name), name).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* Reglas con datos de prueba mínimos (cada regla por separado)        */
/* ------------------------------------------------------------------ */

function mk(name: string, arcana: ArcanaId, level: number, flags: Partial<Persona['flags']> = {}): Persona {
  return {
    id: name.toLowerCase(), name, arcana, level,
    flags: { dlc: false, treasure: false, special: false, picaro: false, ...flags },
    specialRecipe: null, unlock: null, resistances: {} as Persona['resistances'],
    stats: null, skills: null, inheritance: null, trait: null, itemization: null, image: null,
  };
}

describe('reglas del motor (datos de prueba)', () => {
  const mini: FusionData = {
    arcanaOrder: ['fool', 'magician', 'chariot'],
    chart: { fool: { magician: 'chariot' }, magician: { fool: 'chariot' } },
    treasureChart: { Gema: { chariot: 1, fool: -1 } },
    specialRecipes: { Especial: ['F1', 'M1'] },
  };
  const F1 = mk('F1', 'fool', 2);
  const F2 = mk('F2', 'fool', 10);
  const F3 = mk('F3', 'fool', 20);
  const F4 = mk('F4', 'fool', 30);
  const M1 = mk('M1', 'magician', 4);
  const M2 = mk('M2', 'magician', 40);
  const C1 = mk('C1', 'chariot', 5);
  const C2 = mk('C2', 'chariot', 15);
  const C3 = mk('C3', 'chariot', 35);
  const G = mk('Gema', 'fool', 25, { treasure: true });
  const DLC = mk('Dlc', 'chariot', 12, { dlc: true });
  const SP = mk('Especial', 'chariot', 50, { special: true });
  const all = [F1, F2, F3, F4, M1, M2, C1, C2, C3, G, DLC, SP];
  const eng = new FusionEngine(all, mini, ALL_ON);

  it('Arcanas distintas: menor nivel ≥ (A+B)/2 + 0,5', () => {
    // F2(10) + M1(4) = 14 → objetivo 7,5 → primera Chariot con nivel ≥ 7,5 es Dlc (12)
    expect(eng.fuse(F2, M1)?.result.name).toBe('Dlc');
    // F3(20) + M1(4) = 24 → objetivo 12,5 → C2 (15)
    expect(eng.fuse(F3, M1)?.result.name).toBe('C2');
  });

  it('Arcanas distintas: si ninguna alcanza, sale la de mayor nivel', () => {
    expect(eng.fuse(F4, M2)?.result.name).toBe('C3');
  });

  it('Misma Arcana: busca hacia abajo y saltea a los ingredientes', () => {
    // F3(20) + F4(30) → tope 26 → la mayor ≤ 26 sin contar ingredientes es F2 (10)
    expect(eng.fuse(F3, F4)?.result.name).toBe('F2');
    // F1(2) + F2(10) → tope 7 → no hay ninguna (F1 es ingrediente)
    expect(eng.fuse(F1, F2)).toBeNull();
  });

  it('Treasure Demon: misma Arcana, sube o baja escalones', () => {
    expect(eng.fuse(C1, G)?.result.name).toBe('Dlc'); // Chariot +1
    expect(eng.fuse(F3, G)?.result.name).toBe('F2'); // Fool −1
    expect(eng.fuse(C3, G)).toBeNull(); // no hay escalón por encima
  });

  it('Fusión especial de 2 ingredientes tiene prioridad', () => {
    expect(eng.fuse(F1, M1)).toEqual({ result: SP, kind: 'special' });
  });

  it('las especiales nunca salen por fusión normal', () => {
    expect(eng.fuse(F4, M2)?.result.name).not.toBe('Especial');
  });

  it('desactivar DLC y tesoros los saca de ingredientes y resultados', () => {
    const off = new FusionEngine(all, mini, { includeDlc: false, includeTreasure: false });
    expect(off.fuse(F2, M1)?.result.name).toBe('C2'); // ya no sale Dlc
    expect(off.fuse(C1, G)).toBeNull(); // el tesoro no participa
  });
});

/* ------------------------------------------------------------------ */
/* Propiedades sobre los 232                                           */
/* ------------------------------------------------------------------ */

describe('propiedades con el compendio completo', () => {
  const eng = new FusionEngine(PERSONAS, DATA, ALL_ON);
  const list = eng.ingredients();

  it('es simétrica, nunca da un ingrediente y nunca da un Treasure Demon', () => {
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const r1 = eng.fuse(list[i], list[j]);
        const r2 = eng.fuse(list[j], list[i]);
        expect(r1?.result.id).toBe(r2?.result.id);
        if (r1) {
          expect(r1.result.id).not.toBe(list[i].id);
          expect(r1.result.id).not.toBe(list[j].id);
          expect(r1.result.flags.treasure).toBe(false);
        }
      }
  });

  it('las especiales solo salen con su receta de 2 ingredientes', () => {
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const r = eng.fuse(list[i], list[j]);
        if (r?.result.flags.special) expect(r.kind).toBe('special');
      }
  });

  it('Persona especial + Treasure Demon no se puede fusionar (comprobado en el juego)', () => {
    const P = (n: string) => PERSONAS.find((p) => p.name === n)!;
    expect(eng.fuse(P('Stone of Scone'), P('Trumpeter'))).toBeNull();
  });

  it('Baal + Odin = Oberon (comprobado en el juego)', () => {
    const P = (n: string) => PERSONAS.find((p) => p.name === n)!;
    expect(eng.fuse(P('Baal'), P('Odin'))?.result.name).toBe('Oberon');
  });

  it('Belial + Nebiros = Alice (receta especial conocida)', () => {
    expect(eng.fuse(P('Belial'), P('Nebiros'))?.result.name).toBe('Alice');
  });
});

/* ------------------------------------------------------------------ */
/* Verificación cruzada 1: cálculo inverso de la referencia            */
/* ------------------------------------------------------------------ */

/**
 * Reimplementación independiente de splitWithDiffRace + splitWithSameRace
 * (aqiu384): dado un resultado, lista los pares que lo producen.
 * Si el motor "hacia adelante" y este cálculo "hacia atrás" coinciden,
 * es una buena señal de que las reglas están bien implementadas.
 */
function referenceFissions(target: Persona, eng: FusionEngine): Set<string> {
  const pairs = new Set<string>();
  const ingredients = eng.ingredients().filter((p) => !p.flags.treasure);
  const results = (arcana: ArcanaId) =>
    eng.ingredients().filter((p) => p.arcana === arcana && !p.flags.special && !p.flags.treasure)
      .map((p) => p.level).sort((a, b) => a - b);
  const key = (a: Persona, b: Persona) => [a.name, b.name].sort().join(' + ');

  const lvls = results(target.arcana);
  const t = lvls.indexOf(target.level);
  if (t === -1) return pairs;

  // Arcanas distintas
  const min = lvls[t - 1] !== undefined ? 2 * (lvls[t - 1] - 0.5) : 0;
  const max = lvls[t + 1] !== undefined ? 2 * (target.level - 0.5) : 200;
  for (let i = 0; i < ingredients.length; i++)
    for (let j = i + 1; j < ingredients.length; j++) {
      const a = ingredients[i], b = ingredients[j];
      if (a.arcana === b.arcana) continue;
      if (DATA.chart[a.arcana]?.[b.arcana] !== target.arcana) continue;
      const s = a.level + b.level;
      if (min < s && s <= max) pairs.add(key(a, b));
    }

  // Misma Arcana
  const max2 = lvls[t + 1] !== undefined ? 2 * (lvls[t + 1] - 1) : 200;
  const next2 = lvls[t + 2] !== undefined ? 2 * (lvls[t + 2] - 1) : 200;
  const min2 = 2 * (target.level - 1);
  const same = ingredients.filter((p) => p.arcana === target.arcana && p.level !== target.level)
    .sort((a, b) => a.level - b.level);
  const mLvl = max2 / 2 + 1;
  const m = same.find((p) => p.level === mLvl && !p.flags.special);
  if (m) for (const p of same) if (mLvl < p.level && mLvl + p.level < next2) pairs.add(key(m, p));
  for (let i = 0; i < same.length; i++)
    for (let j = i + 1; j < same.length; j++) {
      const s = same[i].level + same[j].level;
      if (min2 <= s && s < max2) pairs.add(key(same[i], same[j]));
    }
  return pairs;
}

describe('verificación cruzada con el cálculo inverso de la referencia', () => {
  const eng = new FusionEngine(PERSONAS, DATA, ALL_ON);
  const targets = eng.ingredients().filter((p) => !p.flags.special && !p.flags.treasure);

  it('ambos cálculos dan los mismos pares para las Personas normales', () => {
    const diffs: string[] = [];
    for (const target of targets) {
      const forward = new Set(
        eng.recipesFor(target)
          .filter((r) => r.kind === 'normal' || r.kind === 'same-arcana')
          .map((r) => [r.a.name, r.b.name].sort().join(' + ')),
      );
      const backward = referenceFissions(target, eng);
      // Los pares que la referencia lista pero que en realidad dan una especial
      // (receta de 2 ingredientes) no cuentan como diferencia.
      for (const k of backward) {
        if (forward.has(k)) continue;
        const [x, y] = k.split(' + ');
        if (eng.fuse(P(x), P(y))?.kind === 'special') continue;
        diffs.push(`${target.name}: falta ${k}`);
      }
      for (const k of forward) {
        if (backward.has(k)) continue;
        // Caso borde conocido (docs/ETAPA-3-fusiones.md): misma Arcana, los ingredientes
        // son exactamente los dos escalones siguientes al resultado. El cálculo inverso
        // de la referencia usa "<" en vez de "≤" y no lo lista, pero su cálculo hacia
        // adelante sí da este resultado (igual que nuestro motor).
        const [x, y] = k.split(' + ').map(P);
        const lv = eng.ingredients()
          .filter((p) => p.arcana === target.arcana && !p.flags.special && !p.flags.treasure)
          .map((p) => p.level).sort((a, b) => a - b);
        const t = lv.indexOf(target.level);
        const edge = x.arcana === target.arcana && y.arcana === target.arcana &&
          [x.level, y.level].sort((a, b) => a - b).join() === [lv[t + 1], lv[t + 2]].join();
        if (!edge) diffs.push(`${target.name}: sobra ${k}`);
      }
    }
    expect(diffs, diffs.slice(0, 20).join('\n')).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* Verificación cruzada 2: recetas de una guía independiente           */
/* ------------------------------------------------------------------ */

describe('recetas publicadas por TheGamer (guía independiente, sin DLC)', () => {
  // La guía no considera Personas DLC: con DLC activado, en Fool salen Orpheus F
  // o Izanagi en lugar de Arsene/High Pixie/Legion. Por eso se prueba sin DLC.
  const eng = new FusionEngine(PERSONAS, DATA, { includeDlc: false, includeTreasure: true });
  const cases: [string, string, string][] = [
    ['Arsene', 'High Pixie', 'Obariyon'],
    ['Obariyon', 'Kelpie', "Jack-o'-Lantern"],
    ['High Pixie', 'Koppa Tengu', 'Incubus'],
    ['Legion', 'Nekomata', 'Shiisaa'],
    ['Ose', 'Unicorn', 'Hell Biker'],
    ["Jack-o'-Lantern", 'Jack Frost', 'Cait Sith'],
    ['Cait Sith', 'Silky', 'Mandrake'],
    ['Jack Frost', 'Succubus', 'Saki Mitama'],
    ['Nekomata', 'Ippon-Datara', 'Angel'],
    ['Sandman', 'Leanan Sidhe', 'Black Ooze'],
    ['Choronzon', 'Isis', 'Nue'],
    ['Queen Mab', 'Thunderbird', 'Jikokuten'],
    ['Rangda', 'Pazuzu', 'Red Rider'],
    ['Silky', 'Agathion', "Jack-o'-Lantern"],
    ['Apsaras', 'Obariyon', 'Bicorn'],
    ['Isis', 'Jack Frost', 'Kodama'],
    ['Yaksini', 'Hua Po', "Jack-o'-Lantern"],
    ['Lamia', 'Sui-Ki', 'Suzaku'],
    ['Eligor', 'Angel', "Jack-o'-Lantern"],
    ['Setanta', 'Sandman', 'Angel'],
    ['Thoth', 'Principality', 'Jikokuten'],
    ['Barong', 'Unicorn', 'Thunderbird'],
    ['Berith', 'Incubus', "Jack-o'-Lantern"],
    ['Orobas', 'Apsaras', 'Succubus'],
  ];

  it.each(cases)('%s = %s + %s', (result, a, b) => {
    expect(eng.fuse(P(a), P(b))?.result.name).toBe(result);
  });
});
