import type { Persona, PersonaType } from '../types';

/**
 * Fusión de Persona 5 Tactica (datos del juego: persona_ore_union_database y persona_ore_union_sp_database).
 *  - Normal (de a 2): el tipo del resultado sale de la tabla de tipos. El nivel objetivo es
 *    ⌊(nivel base A + nivel base B) / 2⌋ + 1, y sale la Persona de ese tipo con el nivel más bajo que
 *    llegue al objetivo, sin contar los ingredientes (también cuando son del mismo tipo).
 *    Cuenta el nivel BASE de cada Persona, no el que tenga en tu partida (visto en el juego: con Genbu
 *    subida a Nv 7, Isis + Genbu da Gran Pixie, que solo cuadra con el Nv 4 base de Genbu).
 *    Solo pueden salir las Personas con `normalFusion` (el juego marca las demás como «solo especial»).
 *  - Especial: ingredientes fijos (de 2 a 6), sin nivel mínimo.
 * Casos vistos en el juego en fusion/check.test.ts.
 */
export interface Recipe {
  kind: 'normal' | 'special';
  ingredients: Persona[];
}

export interface EngineOptions {
  /** Contar las Personas de DLC (Pícaros y Raoul) como posibles resultados e ingredientes */
  dlc: boolean;
}

export class FusionEngine {
  private byType = new Map<PersonaType, Persona[]>();
  private byId: Map<string, Persona>;
  private pool: Persona[];

  constructor(
    personas: Persona[],
    private chart: Record<PersonaType, Record<PersonaType, PersonaType>>,
    opts: EngineOptions,
  ) {
    const dlcOk = (p: Persona) => opts.dlc || (p.unlock !== 'dlc' && p.unlock !== 'bonus');
    this.pool = personas.filter(dlcOk);
    this.byId = new Map(personas.map((p) => [p.id, p]));
    for (const p of this.pool.filter((x) => x.normalFusion)) {
      const list = this.byType.get(p.type) ?? [];
      list.push(p);
      this.byType.set(p.type, list);
    }
    for (const list of this.byType.values()) list.sort((a, b) => a.level - b.level);
  }

  /** Resultado de la fusión normal de dos Personas. */
  fuse(a: Persona, b: Persona): Persona | undefined {
    if (a.id === b.id) return undefined;
    const pair = this.specialPair(a, b);
    if (pair) return pair;
    const type = this.chart[a.type]?.[b.type];
    if (!type) return undefined;
    const target = Math.floor((a.level + b.level) / 2) + 1;
    const list = this.byType.get(type) ?? [];
    return list.find((p) => p.level >= target && p.id !== a.id && p.id !== b.id);
  }

  /** Fusión especial de exactamente estas dos Personas (Shiva = Rangda + Barong, Ardha, Alice). */
  private specialPair(a: Persona, b: Persona): Persona | undefined {
    return this.pool.find((r) => r.special?.length === 2 && r.special.includes(a.id) && r.special.includes(b.id));
  }

  /** Persona que sale de estos ingredientes (2 → normal o especial; más → especial). */
  resultOf(ings: Persona[]): Persona | undefined {
    const ids = ings.map((p) => p.id).sort().join();
    const special = this.pool.find((r) => r.special && [...r.special].sort().join() === ids);
    if (special) return special;
    return ings.length === 2 ? this.fuse(ings[0], ings[1]) : undefined;
  }

  recipesFor(r: Persona): Recipe[] {
    if (r.special) {
      const ings = r.special.map((id) => this.byId.get(id)).filter((p): p is Persona => !!p);
      return ings.length === r.special.length ? [{ kind: 'special', ingredients: ings }] : [];
    }
    if (!r.normalFusion || !this.pool.includes(r)) return [];
    const out: Recipe[] = [];
    for (let i = 0; i < this.pool.length; i++) {
      for (let j = i + 1; j < this.pool.length; j++) {
        const a = this.pool[i], b = this.pool[j];
        if (!this.specialPair(a, b) && this.fuse(a, b)?.id === r.id) out.push({ kind: 'normal', ingredients: a.level <= b.level ? [a, b] : [b, a] });
      }
    }
    return out.sort((x, y) => x.ingredients[1].level - y.ingredients[1].level || x.ingredients[0].level - y.ingredients[0].level);
  }

  /** Todo lo que se puede crear con esta Persona como ingrediente. */
  fusionsWith(p: Persona): { result: Persona; recipe: Recipe }[] {
    const out: { result: Persona; recipe: Recipe }[] = [];
    for (const other of this.pool) {
      if (this.specialPair(p, other)) continue;
      const result = this.fuse(p, other);
      if (result) out.push({ result, recipe: { kind: 'normal', ingredients: [p, other] } });
    }
    for (const r of this.pool.filter((x) => x.special?.includes(p.id))) out.push({ result: r, recipe: this.recipesFor(r)[0] });
    return out.filter((x) => x.recipe).sort((a, b) => a.result.level - b.result.level);
  }
}
