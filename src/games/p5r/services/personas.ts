import type { ArcanaId, Persona, SkillInfo } from '../types';
import personasJson from '../data/generated/personas.json';
import partyJson from '../data/generated/party.json';
import skillsJson from '../data/generated/skills.json';
import { ARCANAS } from '../data/arcana';
import { byPersonaName, personaMatches } from './gameText';

/**
 * Acceso a los datos de Personas (compendio completo de P5R).
 * Los JSON se generan con scripts/import-aqiu384/import.mjs.
 */
const PERSONAS = personasJson as unknown as Persona[];
/** Personas de los compañeros: tienen ficha pero no entran en la fusión. */
const PARTY = partyJson as unknown as Persona[];
const CATALOG = [...PERSONAS, ...PARTY];
const SKILLS = skillsJson as unknown as Record<string, SkillInfo>;

/** Personas que se pueden fusionar (las que usa la calculadora). */
export function getAllPersonas(): Persona[] {
  return PERSONAS;
}

export function getPartyPersonas(): Persona[] {
  return PARTY;
}

/** Todo lo que muestra el catálogo: fusionables + Personas de compañeros. */
export function getCatalogPersonas(): Persona[] {
  return CATALOG;
}

export function getPersona(id: string): Persona | undefined {
  return CATALOG.find((p) => p.id === id);
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
  /** Personas de compañeros, por forma */
  partyInitial: boolean;
  partyEvolved: boolean;
  partyThird: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  arcanas: [],
  minLevel: 1,
  maxLevel: 99,
  includeDlc: true,
  includeTreasure: true,
  partyInitial: true,
  // Evolucionadas y tercer semestre son spoiler: se activan desde "Más filtros"
  partyEvolved: false,
  partyThird: false,
  sort: 'level-asc',
};

const arcanaOrder = new Map(ARCANAS.map((a, i) => [a.id, i]));

export function filterPersonas(list: Persona[], f: CatalogFilters): Persona[] {
  const result = list.filter((p) => {
    if (!f.includeDlc && p.flags.dlc) return false;
    if (!f.includeTreasure && p.flags.treasure) return false;
    if (p.party) {
      const on = { initial: f.partyInitial, evolved: f.partyEvolved, third: f.partyThird }[p.party.stage];
      if (!on) return false;
    }
    if (!personaMatches(p, f.query)) return false;
    if (f.arcanas.length && !f.arcanas.includes(p.arcana)) return false;
    if (p.level < f.minLevel || p.level > f.maxLevel) return false;
    return true;
  });

  return result.sort((a, b) => {
    switch (f.sort) {
      case 'name-asc':
        return byPersonaName(a, b);
      case 'level-desc':
        return b.level - a.level || byPersonaName(a, b);
      case 'level-asc':
      default:
        return (
          a.level - b.level ||
          (arcanaOrder.get(a.arcana)! - arcanaOrder.get(b.arcana)!) ||
          byPersonaName(a, b)
        );
    }
  });
}
