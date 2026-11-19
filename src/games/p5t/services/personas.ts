import personasJson from '../data/generated/personas.json';
import fusionJson from '../data/generated/fusion.json';
import type { Persona, PersonaSkill, PersonaType } from '../types';
import { L } from '../../../i18n';

const PERSONAS = personasJson as unknown as Persona[];
const FUSION = fusionJson as unknown as { types: Record<PersonaType, { es: string; en: string }>; chart: Record<PersonaType, Record<PersonaType, PersonaType>> };

/** Orden de los tipos como en el juego (por id interno). */
export const TYPES: PersonaType[] = ['burn', 'freeze', 'sweep', 'despair', 'shock', 'vortex', 'brainwash', 'dizzy', 'forget', 'sleep'];
export const typeName = (t: PersonaType) => L(FUSION.types[t].es, FUSION.types[t].en);
export const CHART = FUSION.chart;

export const getAllPersonas = (): Persona[] => PERSONAS;
export const getPersona = (id: string) => PERSONAS.find((p) => p.id === id);
export const personaName = (p: Persona) => L(p.nameEs, p.nameEn);
export const skillName = (s: PersonaSkill) => L(s.nameEs ?? s.nameEn ?? '', s.nameEn ?? s.nameEs ?? '');
export const skillDescription = (s: PersonaSkill) => L(s.descEs ?? s.descEn ?? '', s.descEn ?? s.descEs ?? '');
export const isDlc = (p: Persona) => p.unlock === 'dlc' || p.unlock === 'bonus';

/** Stats a un nivel dado: base + crecimiento por nivel (redondeado hacia abajo). */
export const statsAt = (p: Persona, level: number) => {
  const n = Math.max(0, level - p.level);
  const f = (k: keyof Persona['stats']) => Math.floor(p.stats[k] + p.growth[k] * n);
  return { hp: f('hp'), sp: f('sp'), melee: f('melee'), gun: f('gun') };
};

export interface CatalogFilters {
  query: string;
  types: PersonaType[];
  minLevel: number;
  maxLevel: number;
  /** Mostrar Personas de DLC */
  dlc: boolean;
  sort: 'level-asc' | 'level-desc' | 'name-asc' | 'type';
}
export const DEFAULT_FILTERS: CatalogFilters = { query: '', types: [], minLevel: 1, maxLevel: 99, dlc: true, sort: 'type' };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export const personaMatches = (p: Persona, q: string) => [p.nameEs, p.nameEn].some((n) => norm(n).includes(norm(q.trim())));

export function filterPersonas(list: Persona[], f: CatalogFilters): Persona[] {
  const out = list.filter((p) => {
    if (f.query.trim() && !personaMatches(p, f.query)) return false;
    if (f.types.length && !f.types.includes(p.type)) return false;
    if (!f.dlc && isDlc(p)) return false;
    return p.level >= f.minLevel && p.level <= f.maxLevel;
  });
  const byName = (a: Persona, b: Persona) => personaName(a).localeCompare(personaName(b));
  const sorts: Record<CatalogFilters['sort'], (a: Persona, b: Persona) => number> = {
    'level-asc': (a, b) => a.level - b.level || byName(a, b),
    'level-desc': (a, b) => b.level - a.level || byName(a, b),
    'name-asc': byName,
    type: (a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type) || a.level - b.level,
  };
  return out.sort(sorts[f.sort]);
}
