import { getItem } from '../../p5r/services/items';
import type { Persona } from '../../p5r/types';
import { getAllPersonas } from './personas';

/** Skill cards de P5 original: salen ejecutando Personas en la silla eléctrica (sin Alarma de fusión). */
export interface SkillCardSource { persona: Persona; alarm: false }

let index: Map<string, SkillCardSource[]> | null = null;
export function skillCardSources(skill: string): SkillCardSource[] {
  if (!index) {
    index = new Map();
    for (const p of getAllPersonas()) {
      if (!p.itemization || getItem(p.itemization)?.type !== 'skillcard') continue;
      const list = index.get(p.itemization) ?? [];
      list.push({ persona: p, alarm: false });
      index.set(p.itemization, list);
    }
    for (const list of index.values()) list.sort((a, b) => a.persona.level - b.persona.level);
  }
  return index.get(skill) ?? [];
}
