import type { BuildStep } from '../../../core/account/builds';
import { getFusionEngine } from '../fusion';
import { getPersona, getSkill } from './personas';
import type { Persona } from '../types';
import inheritJson from '../data/inheritance.json';
import { L } from '../../../i18n';

export type StepCheck = 'ok' | 'bad' | 'incomplete';
/** En Strikers se heredan hasta 4 habilidades (visto en el juego). */
export const MAX_INHERIT = 4;


/** Verifica con las recetas de Strikers que los ingredientes den el resultado. */
export function checkStep(s: BuildStep): StepCheck {
  const ings = s.ingredients.map((i) => getPersona(i.persona));
  const result = getPersona(s.result);
  if (!result || ings.length < 2 || ings.some((p) => !p)) return 'incomplete';
  const e = getFusionEngine();
  return e.recipesFor(result).some((r) => e.matches(r, ings as Persona[])) ? 'ok' : 'bad';
}

/** Ingredientes fijos si el resultado es una fusión especial (para autocompletar). */
export function specialIngredients(resultId: string): string[] | null {
  const p = getPersona(resultId);
  return p?.special ? getFusionEngine().recipesFor(p)[0]?.ingredients.map((i) => i.persona.id) ?? null : null;
}

/** Qué sale de fusionar estas dos Personas (Strikers no tiene tabla: se busca en las recetas). */
export function fuseResult(a: string, b: string): string | null {
  const pa = getPersona(a);
  const pb = getPersona(b);
  return pa && pb ? getFusionEngine().resultOf([pa, pb])?.id ?? null : null;
}

/** Niveles mínimos que pide la receta que usa este paso (para avisar «subila a Nv X»). */
export function levelNeeds(s: BuildStep): { persona: string; level: number }[] {
  const result = getPersona(s.result);
  const ings = s.ingredients.map((i) => getPersona(i.persona));
  if (!result || ings.some((p) => !p)) return [];
  const e = getFusionEngine();
  const rec = e.recipesFor(result).find((r) => e.matches(r, ings as Persona[]));
  if (!rec) return [];
  return (ings as Persona[]).flatMap((p) => {
    const slot = rec.ingredients.find((i) => i.persona.id === p.id) ?? rec.ingredients.find((i) => i.anyOfArcana && i.persona.arcana === p.arcana);
    return slot?.minLevel && slot.minLevel > p.level ? [{ persona: p.id, level: slot.minLevel }] : [];
  });
}

// Regla de herencia de P5 (misma en Strikers; confirmado: Dominio, de Bendición, no hereda Eigaon).
const INH = inheritJson as { elems: string[]; inherits: string[]; ratios: string[] };
/** Si la Persona puede heredar esa habilidad según su tipo. */
export function canInherit(personaId: string, skill: string): boolean {
  const p = getPersona(personaId);
  const el = getSkill(skill)?.element;
  if (!p || !el) return true;
  const row = INH.ratios[INH.inherits.indexOf(p.inheritance ?? 'none')];
  const col = INH.elems.indexOf(el === 'ble' ? 'ble' : el === 'cur' ? 'cur' : el);
  if (!row) return true;
  if (col === -1) return p.inheritance !== 'none';
  return row[col] === 'o';
}

export interface Requirement {
  kind: 'confidant' | 'dlc' | 'story';
  text: string;
  personas: string[];
}

/** Qué hace falta para conseguir una Persona (null si nada especial). */
export function personaRequirement(p: Persona): Omit<Requirement, 'personas'> | null {
  const r = p.prereq;
  if (!r || r === 'Enemy Only') return null;
  if (r === 'New Game+') return { kind: 'story', text: L('Nueva partida+', 'New Game+') };
  const jail = r.match(/(\w+) Jail/);
  if (jail) return { kind: 'story', text: L(`Vencerla en la Cárcel de ${jail[1] === 'Kyoto' ? 'Kioto' : jail[1]}`, `Defeat it in the ${jail[1]} Jail`) };
  return { kind: 'story', text: r };
}

export function buildRequirements(personaIds: string[]): Requirement[] {
  const map = new Map<string, Requirement>();
  for (const id of new Set(personaIds)) {
    const p = getPersona(id);
    const r = p && personaRequirement(p);
    if (!r) continue;
    const k = `${r.kind}|${r.text}`;
    const cur = map.get(k) ?? { ...r, personas: [] };
    cur.personas.push(id);
    map.set(k, cur);
  }
  return [...map.values()].sort((a, b) => a.text.localeCompare(b.text));
}

/** Strikers no tiene skill cards para enseñar. */
export const isSkillCard = (_skill: string) => false;
