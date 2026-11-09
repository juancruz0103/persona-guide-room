import type { ArcanaId, Persona, SkillInfo } from '../types';
import personasJson from '../data/generated/personas.json';
import skillsJson from '../data/generated/skills.json';
import { ARCANAS } from '../data/arcana';

/**
 * Acceso a los datos de Personas (compendio completo de P5R).
 * Los JSON se generan con scripts/import-aqiu384/import.mjs.
 */
const PERSONAS = personasJson as unknown as Persona[];
const SKILLS = skillsJson as unknown as Record<string, SkillInfo>;

export function getAllPersonas(): Persona[] {
  return PERSONAS;
}

export function getPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function getSkill(name: string): SkillInfo | undefined {
  return SKILLS[name];
}

export function getAllSkills(): SkillInfo[] {
  return Object.values(SKILLS);
}

/* ---------- Filtros y orden del catálogo ---------- */

export type SortKey = 'level-asc' | 'level-desc' | 'name-asc';

export interface CatalogFilters {
  query: string;
  arcanas: ArcanaId[];
  minLevel: number;
  maxLevel: number;
  includeDlc: boolean;
  includeTreasure: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  arcanas: [],
  minLevel: 1,
  maxLevel: 99,
  includeDlc: true,
  includeTreasure: true,
  sort: 'level-asc',
};

const arcanaOrder = new Map(ARCANAS.map((a, i) => [a.id, i]));

export function filterPersonas(list: Persona[], f: CatalogFilters): Persona[] {
  const q = f.query.trim().toLowerCase();
  const result = list.filter((p) => {
    if (!f.includeDlc && p.flags.dlc) return false;
    if (!f.includeTreasure && p.flags.treasure) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (f.arcanas.length && !f.arcanas.includes(p.arcana)) return false;
    if (p.level < f.minLevel || p.level > f.maxLevel) return false;
    return true;
  });

  return result.sort((a, b) => {
    switch (f.sort) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'level-desc':
        return b.level - a.level || a.name.localeCompare(b.name);
      case 'level-asc':
      default:
        return (
          a.level - b.level ||
          (arcanaOrder.get(a.arcana)! - arcanaOrder.get(b.arcana)!) ||
          a.name.localeCompare(b.name)
        );
    }
  });
}
