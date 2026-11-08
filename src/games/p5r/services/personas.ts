import type { ArcanaId, Persona, SkillInfo } from '../types';
import personasJson from '../data/personas.sample.json';
import skillsJson from '../data/skills.sample.json';
import { ARCANAS } from '../data/arcana';

/**
 * Acceso a los datos de Personas.
 * Hoy lee una muestra; en la Etapa 3 este archivo pasa a leer el compendio
 * completo sin que las pantallas tengan que cambiar.
 */
const PERSONAS = personasJson as Persona[];
const SKILLS = skillsJson as Record<string, SkillInfo>;

export const IS_SAMPLE_DATA = true;

export function getAllPersonas(): Persona[] {
  return PERSONAS;
}

export function getPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function getSkill(name: string): SkillInfo | undefined {
  return SKILLS[name];
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
