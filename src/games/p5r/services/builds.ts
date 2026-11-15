import type { BuildStep } from '../../../core/account/builds';
import { getArcana } from '../data/arcana';
import { getFusionEngine } from './fusion';
import { getPersona } from './personas';
import type { Persona } from '../types';
import { L, tr } from '../../../i18n';

export type StepCheck = 'ok' | 'bad' | 'incomplete';

/** Verifica con la calculadora de Royal que los ingredientes den el resultado. */
export function checkStep(s: BuildStep): StepCheck {
  const ings = s.ingredients.map((i) => getPersona(i.persona));
  const result = getPersona(s.result);
  if (!result || ings.length < 2 || ings.some((p) => !p)) return 'incomplete';
  const engine = getFusionEngine({ includeDlc: true, includeTreasure: true });
  const special = engine.specialRecipe(result);
  if (special && special.length === ings.length) {
    const want = special.map((p) => p.id).sort().join('|');
    const got = ings.map((p) => p!.id).sort().join('|');
    if (want === got) return 'ok';
  }
  if (ings.length === 2) return engine.fuse(ings[0]!, ings[1]!)?.result.id === result.id ? 'ok' : 'bad';
  return 'bad';
}

/** Ingredientes fijos si el resultado es una fusión especial (para autocompletar). */
export function specialIngredients(resultId: string): string[] | null {
  const p = getPersona(resultId);
  if (!p) return null;
  return getFusionEngine({ includeDlc: true, includeTreasure: true }).specialRecipe(p)?.map((x) => x.id) ?? null;
}

export interface Requirement {
  kind: 'confidant' | 'dlc' | 'story';
  text: string;
  personas: string[];
}

/** Qué hace falta para conseguir una Persona (null si nada especial). */
export function personaRequirement(p: Persona): Omit<Requirement, 'personas'> | null {
  const u = p.unlock;
  if (u?.type === 'confidant') return { kind: 'confidant', text: `${getArcana(u.arcana).name} ${L('rango', 'rank')} ${u.rank}` };
  if (u?.type === 'dlc' || p.flags.dlc) return { kind: 'dlc', text: u?.type === 'dlc' ? u.pack : 'DLC' };
  if (u?.type === 'story') return { kind: 'story', text: tr(u.detail) };
  return null;
}

/** Requisitos de toda la build, agrupados (confidentes al máximo, DLC, avance de la historia). */
export function buildRequirements(personaIds: string[]): Requirement[] {
  const map = new Map<string, Requirement>();
  for (const id of new Set(personaIds)) {
    const p = getPersona(id);
    const r = p && personaRequirement(p);
    if (!r) continue;
    const key = `${r.kind}|${r.text}`;
    const cur = map.get(key) ?? { ...r, personas: [] };
    cur.personas.push(id);
    map.set(key, cur);
  }
  const order = { confidant: 0, dlc: 1, story: 2 };
  return [...map.values()].sort((a, b) => order[a.kind] - order[b.kind] || a.text.localeCompare(b.text));
}

/** Qué Persona da realmente una fusión de 2 (para avisar cuando no coincide). */
export function fuseResult(a: string, b: string): string | null {
  const pa = getPersona(a);
  const pb = getPersona(b);
  if (!pa || !pb) return null;
  return getFusionEngine({ includeDlc: true, includeTreasure: true }).fuse(pa, pb)?.result.id ?? null;
}
