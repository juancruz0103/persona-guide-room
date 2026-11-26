/**
 * Motor de fusiones de Persona 4 Revival (fusión de 2 Personas + especiales).
 * Mismas reglas de nivel que la familia P3/P4/P5 de la herramienta de referencia
 * (aqiu384/megaten-fusion-tool, dominio público). Las Personas de compañeros no se fusionan.
 */
import type { ArcanaId, Persona } from '../types';

export interface FusionData {
  arcanaOrder: ArcanaId[];
  chart: Partial<Record<ArcanaId, Partial<Record<ArcanaId, ArcanaId>>>>;
  specialRecipes: Record<string, string[]>;
}

export interface FusionOptions {
  /** P4R no tiene Personas DLC en la tabla de fusión; se deja por compatibilidad. */
  includeDlc?: boolean;
}

export type FusionKind = 'normal' | 'same-arcana' | 'special';

export interface FusionResult {
  result: Persona;
  kind: FusionKind;
}

export interface Recipe {
  a: Persona;
  b: Persona;
  kind: FusionKind;
}

export class FusionEngine {
  private readonly byName = new Map<string, Persona>();
  private readonly byId = new Map<string, Persona>();
  private readonly included: Persona[];
  private readonly results = new Map<ArcanaId, Persona[]>();
  private readonly specialPairs = new Map<string, Persona>();

  constructor(
    personas: Persona[],
    private readonly data: FusionData,
    readonly options: FusionOptions,
  ) {
    const fusable = personas.filter((p) => !p.party);
    for (const p of fusable) {
      this.byName.set(p.name, p);
      this.byId.set(p.id, p);
    }
    this.included = fusable.filter((p) => this.isIncluded(p));
    for (const p of this.included) {
      if (p.flags.special) continue;
      const list = this.results.get(p.arcana) ?? [];
      list.push(p);
      this.results.set(p.arcana, list);
    }
    for (const list of this.results.values()) list.sort((x, y) => x.level - y.level);
    for (const [name, ingredients] of Object.entries(data.specialRecipes)) {
      const result = this.byName.get(name);
      if (ingredients.length === 2 && result && this.isIncluded(result)) {
        this.specialPairs.set(pairKey(ingredients[0], ingredients[1]), result);
      }
    }
  }

  isIncluded(_p: Persona): boolean {
    return true;
  }

  getById(id: string): Persona | undefined {
    return this.byId.get(id);
  }

  ingredients(): Persona[] {
    return this.included;
  }

  specialRecipe(p: Persona): Persona[] | null {
    const names = this.data.specialRecipes[p.name];
    if (!names) return null;
    return names.map((n) => this.byName.get(n)).filter((x): x is Persona => !!x);
  }

  fuse(a: Persona, b: Persona): FusionResult | null {
    if (a.id === b.id) return null;
    if (!this.isIncluded(a) || !this.isIncluded(b)) return null;
    const special = this.specialPairs.get(pairKey(a.name, b.name));
    if (special) return { result: special, kind: 'special' };
    return a.arcana === b.arcana ? this.fuseSameArcana(a, b) : this.fuseDiffArcana(a, b);
  }

  recipesFor(target: Persona): Recipe[] {
    const recipes: Recipe[] = [];
    const list = this.included;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const r = this.fuse(list[i], list[j]);
        if (r && r.result.id === target.id) {
          const [a, b] = list[i].level <= list[j].level ? [list[i], list[j]] : [list[j], list[i]];
          recipes.push({ a, b, kind: r.kind });
        }
      }
    }
    return recipes.sort(
      (x, y) => x.a.level + x.b.level - (y.a.level + y.b.level) || x.a.name.localeCompare(y.a.name),
    );
  }

  /** Arcanas distintas: menor nivel que cumpla A + B ≤ 2·nivel − 1; si ninguna, la mayor. */
  private fuseDiffArcana(a: Persona, b: Persona): FusionResult | null {
    const arcana = this.data.chart[a.arcana]?.[b.arcana];
    if (!arcana) return null;
    const list = this.results.get(arcana);
    if (!list?.length) return null;
    const sum = a.level + b.level;
    let i = list.findIndex((p) => sum <= 2 * p.level - 1);
    if (i === -1) i = list.length - 1;
    while (list[i] && (list[i].id === a.id || list[i].id === b.id)) i++;
    const result = list[i];
    return result ? { result, kind: 'normal' } : null;
  }

  /** Misma Arcana: hacia abajo, la de mayor nivel ≤ (A+B)/2 + 1 sin contar los ingredientes. */
  private fuseSameArcana(a: Persona, b: Persona): FusionResult | null {
    const list = (this.results.get(a.arcana) ?? []).filter((p) => p.id !== a.id && p.id !== b.id);
    const cap = (a.level + b.level) / 2 + 1;
    let result: Persona | undefined;
    for (const p of list) if (p.level <= cap) result = p;
    return result ? { result, kind: 'same-arcana' } : null;
  }
}

function pairKey(x: string, y: string): string {
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}
