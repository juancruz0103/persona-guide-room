import { P4R_PERSONAS } from '../fusion';
import type { ArcanaId, Persona } from '../types';
import { personaName } from './text';
import { ARCANAS } from '../data/arcana';

export const getAllPersonas = (): Persona[] => P4R_PERSONAS;
export const getPersona = (id: string) => P4R_PERSONAS.find((p) => p.id === id);
export const getPersonaByName = (name: string) => P4R_PERSONAS.find((p) => p.name === name);

export interface CatalogFilters {
  query: string;
  arcanas: ArcanaId[];
  minLevel: number;
  maxLevel: number;
  party: 'all' | 'only' | 'none';
  /** Mostrar las evoluciones de los compañeros (spoiler) */
  evolved: boolean;
  sort: 'level-asc' | 'level-desc' | 'name-asc' | 'arcana';
}
export const DEFAULT_FILTERS: CatalogFilters = {
  query: '', arcanas: [], minLevel: 1, maxLevel: 99, party: 'all', evolved: false, sort: 'arcana',
};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const arcanaIndex = (id: ArcanaId) => ARCANAS.findIndex((a) => a.id === id);

export function filterPersonas(list: Persona[], f: CatalogFilters): Persona[] {
  const q = norm(f.query.trim());
  const out = list.filter((p) => {
    if (q && ![p.name, p.nameEn, p.nameEs ?? ''].some((n) => norm(n).includes(q))) return false;
    if (f.arcanas.length && !f.arcanas.includes(p.arcana)) return false;
    if (f.party === 'only' && !p.party) return false;
    if (f.party === 'none' && p.party) return false;
    if (p.party && p.party.stage !== 'initial' && !f.evolved) return false;
    if (!p.party && (p.level < f.minLevel || p.level > f.maxLevel)) return false;
    return true;
  });
  const byName = (a: Persona, b: Persona) => personaName(a).localeCompare(personaName(b));
  const sorts: Record<CatalogFilters['sort'], (a: Persona, b: Persona) => number> = {
    'level-asc': (a, b) => a.level - b.level || byName(a, b),
    'level-desc': (a, b) => b.level - a.level || byName(a, b),
    'name-asc': byName,
    arcana: (a, b) => arcanaIndex(a.arcana) - arcanaIndex(b.arcana) || a.level - b.level,
  };
  return out.sort(sorts[f.sort]);
}

/** Dueño de cada Persona de compañero (nombres propios). */
export const PARTY_OWNER: Record<string, string> = {
  yosuke: 'Yosuke', chie: 'Chie', yukiko: 'Yukiko', kanji: 'Kanji', rise: 'Rise', teddie: 'Teddie', naoto: 'Naoto',
};
