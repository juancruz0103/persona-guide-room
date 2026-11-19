import type { Persona } from '../types';

/**
 * Fusión de Persona 5 Strikers.
 * No hay tabla de Arcanas: cada Persona sale de recetas fijas (confirmado en el juego, Velvet Room).
 *  1. Recetas propias de la Persona (2 o 3 ingredientes).
 *  2. Misma Arcana: la Persona inmediatamente superior de su Arcana + cualquier otra más alta de esa Arcana.
 *  3. «Hacia abajo»: la Persona inmediatamente superior de su Arcana + un ingrediente fijo
 *     (ej.: Dominio = Metatrón + Rey Frost, visto en el juego).
 *  4. Especiales: ingredientes fijos con nivel mínimo.
 * Lógica tomada de aqiu384/megaten-fusion-tool (dominio público), archivo p5s-nonelem-fusions.ts.
 */
export interface Recipe {
  kind: 'recipe' | 'arcana' | 'down' | 'special';
  ingredients: { persona: Persona; minLevel?: number }[];
}

export class FusionEngine {
  private byName: Map<string, Persona>;
  private byArcana = new Map<string, Persona[]>();

  constructor(private personas: Persona[]) {
    this.byName = new Map(personas.map((p) => [p.name, p]));
    for (const p of personas.filter((x) => !x.party)) {
      const list = this.byArcana.get(p.arcana) ?? [];
      list.push(p);
      this.byArcana.set(p.arcana, list);
    }
    for (const list of this.byArcana.values()) list.sort((a, b) => a.level - b.level);
  }

  /** Persona inmediatamente superior en la misma Arcana. */
  private next(p: Persona): Persona | undefined {
    return this.byArcana.get(p.arcana)?.find((x) => x.level > p.level);
  }

  private get = (name: string) => this.byName.get(name);

  recipesFor(r: Persona): Recipe[] {
    if (r.party) return [];
    if (r.special) {
      return [{ kind: 'special', ingredients: r.special.map((s) => ({ persona: this.get(s.name)!, minLevel: s.level })) }];
    }
    const out: Recipe[] = r.recipes.map((names) => ({ kind: 'recipe', ingredients: names.map((n) => ({ persona: this.get(n)! })) }));
    const next = this.next(r);
    if (next) {
      for (const d of r.down) out.push({ kind: 'down', ingredients: [{ persona: next }, { persona: this.get(d)! }] });
      for (const up of this.byArcana.get(r.arcana)!.filter((x) => x.level > next.level)) {
        out.push({ kind: 'arcana', ingredients: [{ persona: next }, { persona: up }] });
      }
    }
    return out.filter((x) => x.ingredients.every((i) => i.persona));
  }

  /** Persona que sale de exactamente estos ingredientes (ids ordenados y unidos con «|»). */
  resultsOf(key: string): string | undefined {
    for (const r of this.personas) {
      for (const rec of this.recipesFor(r)) {
        if (rec.ingredients.map((i) => i.persona.id).sort().join('|') === key) return r.id;
      }
    }
    return undefined;
  }

  /** Todo lo que se puede crear usando esta Persona como ingrediente. */
  fusionsWith(p: Persona): { result: Persona; recipe: Recipe }[] {
    const out: { result: Persona; recipe: Recipe }[] = [];
    for (const r of this.personas) {
      for (const recipe of this.recipesFor(r)) {
        if (recipe.ingredients.some((i) => i.persona.id === p.id)) out.push({ result: r, recipe });
      }
    }
    return out.sort((a, b) => a.result.level - b.result.level);
  }
}
