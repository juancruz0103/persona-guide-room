/**
 * Motor de fusiones de Persona 5 Royal (fusión de 2 Personas).
 * ------------------------------------------------------------
 * TypeScript puro: no depende de React. La interfaz solo llama a
 * `fuse()` y `recipesFor()`.
 *
 * Las reglas replican la herramienta de referencia (aqiu384/megaten-fusion-tool,
 * dominio público) y están documentadas en docs/ETAPA-3-fusiones.md.
 */
import type { ArcanaId, Persona } from '../types';

export interface FusionData {
  arcanaOrder: ArcanaId[];
  /** chart[a][b] = Arcana resultante (simétrica). Sin entrada = no hay resultado. */
  chart: Partial<Record<ArcanaId, Partial<Record<ArcanaId, ArcanaId>>>>;
  /** treasureChart[tesoro][arcana] = escalones que sube (+) o baja (−) */
  treasureChart: Record<string, Partial<Record<ArcanaId, number>>>;
  /** Fusiones especiales: resultado → ingredientes fijos */
  specialRecipes: Record<string, string[]>;
}

export interface FusionOptions {
  includeDlc: boolean;
  includeTreasure: boolean;
}

export type FusionKind = 'normal' | 'same-arcana' | 'treasure' | 'two-treasures' | 'special';

export interface FusionResult {
  result: Persona;
  kind: FusionKind;
  /**
   * true cuando la regla aplicada no está verificada (Treasure Demon + Persona especial).
   * La interfaz debe avisarlo.
   */
  unverified?: boolean;
}

export interface Recipe {
  a: Persona;
  b: Persona;
  kind: FusionKind;
  unverified?: boolean;
}

export class FusionEngine {
  private readonly byName = new Map<string, Persona>();
  private readonly byId = new Map<string, Persona>();
  private readonly included: Persona[];
  /** Personas que pueden SALIR de una fusión normal, por Arcana y ordenadas por nivel */
  private readonly results = new Map<ArcanaId, Persona[]>();
  /** Recetas especiales de exactamente 2 ingredientes: "A|B" → resultado */
  private readonly specialPairs = new Map<string, Persona>();

  constructor(
    personas: Persona[],
    private readonly data: FusionData,
    readonly options: FusionOptions,
  ) {
    for (const p of personas) {
      this.byName.set(p.name, p);
      this.byId.set(p.id, p);
    }

    this.included = personas.filter((p) => this.isIncluded(p));

    for (const p of this.included) {
      if (p.flags.special || p.flags.treasure) continue;
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

  /** ¿La Persona participa con las opciones actuales? */
  isIncluded(p: Persona): boolean {
    if (p.flags.dlc && !this.options.includeDlc) return false;
    if (p.flags.treasure && !this.options.includeTreasure) return false;
    return true;
  }

  getById(id: string): Persona | undefined {
    return this.byId.get(id);
  }

  /** Personas disponibles como ingrediente con las opciones actuales. */
  ingredients(): Persona[] {
    return this.included;
  }

  /** Ingredientes fijos si la Persona es una fusión especial. */
  specialRecipe(p: Persona): Persona[] | null {
    const names = this.data.specialRecipes[p.name];
    if (!names) return null;
    return names.map((n) => this.byName.get(n)).filter((x): x is Persona => !!x);
  }

  /** Resultado de fusionar A + B, o null si no hay resultado posible. */
  fuse(a: Persona, b: Persona): FusionResult | null {
    if (a.id === b.id) return null;
    if (!this.isIncluded(a) || !this.isIncluded(b)) return null;

    // 1. Fusión especial de 2 ingredientes: tiene prioridad sobre las reglas generales.
    const special = this.specialPairs.get(pairKey(a.name, b.name));
    if (special) return { result: special, kind: 'special' };

    // 2. Treasure Demons
    if (a.flags.treasure && b.flags.treasure) return this.fuseTwoTreasures(a, b);
    if (a.flags.treasure) return this.fuseWithTreasure(b, a);
    if (b.flags.treasure) return this.fuseWithTreasure(a, b);

    // 3. Misma Arcana / Arcanas distintas
    return a.arcana === b.arcana ? this.fuseSameArcana(a, b) : this.fuseDiffArcana(a, b);
  }

  /** Todas las combinaciones de 2 Personas que dan `target` (búsqueda inversa). */
  recipesFor(target: Persona): Recipe[] {
    const recipes: Recipe[] = [];
    const list = this.included;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const r = this.fuse(list[i], list[j]);
        if (r && r.result.id === target.id) {
          const [a, b] = list[i].level <= list[j].level ? [list[i], list[j]] : [list[j], list[i]];
          recipes.push({ a, b, kind: r.kind, unverified: r.unverified });
        }
      }
    }
    // Orden: primero las fusiones normales, después las que usan tesoros y al final
    // las no verificadas. Dentro de cada grupo, de menor a mayor nivel.
    const rank = (r: Recipe) => (r.unverified ? 3 : r.kind === 'treasure' || r.kind === 'two-treasures' ? 2 : 1);
    return recipes.sort(
      (x, y) =>
        rank(x) - rank(y) ||
        x.a.level + x.b.level - (y.a.level + y.b.level) ||
        x.a.name.localeCompare(y.a.name),
    );
  }

  /* ---------- Reglas ---------- */

  /**
   * Arcanas distintas: la tabla da la Arcana del resultado. Sale la Persona de
   * menor nivel cuyo nivel base cumpla  A + B ≤ 2·nivel − 1  (o sea, nivel ≥ (A+B)/2 + 0,5).
   * Si ninguna llega, sale la de mayor nivel. Si el resultado es uno de los
   * ingredientes, se pasa a la siguiente hacia arriba.
   */
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

  /**
   * Misma Arcana: se busca hacia ABAJO. Sale la Persona de mayor nivel con
   * nivel ≤ (A+B)/2 + 1, sin contar a los ingredientes. Si no hay, no hay resultado.
   * (La referencia excluye un ingrediente y "salta" el otro; excluir a los dos da
   * el mismo resultado y además es simétrico: A+B = B+A.)
   */
  private fuseSameArcana(a: Persona, b: Persona): FusionResult | null {
    const list = (this.results.get(a.arcana) ?? []).filter((p) => p.id !== a.id && p.id !== b.id);
    const cap = (a.level + b.level) / 2 + 1;
    let result: Persona | undefined;
    for (const p of list) if (p.level <= cap) result = p;
    return result ? { result, kind: 'same-arcana' } : null;
  }

  /**
   * Persona + Treasure Demon: el resultado queda en la MISMA Arcana de la Persona
   * y sube o baja tantos escalones como indique la tabla de tesoros.
   */
  private fuseWithTreasure(p: Persona, treasure: Persona): FusionResult | null {
    const offset = this.data.treasureChart[treasure.name]?.[p.arcana];
    if (!offset) return null;
    const list = this.results.get(p.arcana) ?? [];

    if (p.flags.special) {
      // ⚠️ Regla no verificada: la referencia calcula este caso de forma distinta según
      // desde qué lado se mire. Usamos su cálculo "desde el tesoro" y lo marcamos.
      const below = list.filter((x) => p.level > x.level).length;
      const idx = offset + below;
      const result = idx > 0 && idx < list.length ? list[idx] : undefined;
      return result ? { result, kind: 'treasure', unverified: true } : null;
    }

    const idx = list.findIndex((x) => x.id === p.id);
    const result = idx === -1 ? undefined : list[idx + offset];
    return result ? { result, kind: 'treasure' } : null;
  }

  /**
   * Dos Treasure Demons: se usa la tabla de Arcanas y sale la primera Persona
   * con 2·nivel > A + B (o la de mayor nivel si ninguna lo cumple).
   */
  private fuseTwoTreasures(a: Persona, b: Persona): FusionResult | null {
    const arcana = this.data.chart[a.arcana]?.[b.arcana];
    if (!arcana) return null;
    const list = this.results.get(arcana);
    if (!list?.length) return null;
    const sum = a.level + b.level;
    const i = list.findIndex((p) => 2 * p.level > sum);
    return { result: list[i === -1 ? list.length - 1 : i], kind: 'two-treasures' };
  }
}

function pairKey(x: string, y: string): string {
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}
