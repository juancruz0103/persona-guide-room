import personasJson from '../data/generated/personas.json';
import skillsJson from '../data/generated/skills.json';
import type { ArcanaId, Persona, SkillInfo } from '../types';
import { ARCANAS } from '../data/arcana';
import { L } from '../../../i18n';

const PERSONAS = personasJson as unknown as Persona[];
const SKILLS = skillsJson as unknown as Record<string, SkillInfo>;

export const getAllPersonas = (): Persona[] => PERSONAS;
export const getPersona = (id: string) => PERSONAS.find((p) => p.id === id);
export const getPersonaByName = (name: string) => PERSONAS.find((p) => p.name === name);
export const getSkill = (name: string): SkillInfo | undefined => SKILLS[name];

export const personaName = (p: Persona) => L(p.nameEs ?? p.nameEn, p.nameEn);
export const skillName = (name: string) => L(SKILLS[name]?.nameEs ?? SKILLS[name]?.nameEn ?? name, SKILLS[name]?.nameEn ?? name);
/** Descripción oficial de Royal si existe; si no, la descripción de la fuente (en inglés). */
export const skillDescription = (name: string): string | null => {
  const s = SKILLS[name];
  if (!s) return null;
  return L(s.descEs ?? s.effect ?? '', s.descEn ?? s.effect ?? '') || null;
};

/** Dueño de cada Persona de compañero (nombre en clave). */
export const PARTY_OWNER: Record<string, string> = {
  joker: 'Joker', skull: 'Skull', mona: 'Mona', panther: 'Panther', fox: 'Fox', queen: 'Queen',
  oracle: 'Oracle', noir: 'Noir', wolf: 'Wolf', sophia: 'Sophia',
};

export interface CatalogFilters {
  query: string;
  arcanas: ArcanaId[];
  minLevel: number;
  maxLevel: number;
  kind: 'all' | 'normal' | 'party';
  /** Mostrar la Persona despertada de Sophia (spoiler) */
  evolved?: boolean;
  sort: 'level-asc' | 'level-desc' | 'name-asc' | 'arcana';
}
export const DEFAULT_FILTERS: CatalogFilters = { query: '', arcanas: [], minLevel: 1, maxLevel: 99, kind: 'all', sort: 'arcana' };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const arcanaIndex = (id: ArcanaId) => ARCANAS.findIndex((a) => a.id === id);

export function filterPersonas(list: Persona[], f: CatalogFilters): Persona[] {
  const q = norm(f.query.trim());
  const out = list.filter((p) => {
    if (q && ![p.name, p.nameEn, p.nameEs ?? ''].some((n) => norm(n).includes(q))) return false;
    if (f.arcanas.length && !f.arcanas.includes(p.arcana)) return false;
    if (f.kind === 'party' && !p.party) return false;
    if (f.kind === 'normal' && p.party) return false;
    if (p.spoiler && !f.evolved) return false;
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
