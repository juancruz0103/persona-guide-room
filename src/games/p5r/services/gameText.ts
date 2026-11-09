import gameTextJson from '../data/generated/game-text.json';
import type { Persona } from '../types';

/**
 * Nombres y descripciones OFICIALES del juego (español de España e inglés),
 * generados con scripts/import-game-text. Los datos internos siguen usando
 * el nombre en inglés de aqiu384 como clave; esto solo cambia lo que se muestra.
 */
interface Text {
  es: string;
  en: string;
  descEs?: string;
  descEn?: string;
}
const TEXT = gameTextJson as unknown as {
  skills: Record<string, Text>;
  personas: Record<string, Text>;
  items: Record<string, Text>;
};

export const personaName = (p: Pick<Persona, 'name'>): string => TEXT.personas[p.name]?.es ?? p.name;
export const personaNameEn = (p: Pick<Persona, 'name'>): string => TEXT.personas[p.name]?.en ?? p.name;
export const skillName = (key: string): string => TEXT.skills[key]?.es ?? key;
export const skillNameEn = (key: string): string => TEXT.skills[key]?.en ?? key;
export const skillDescription = (key: string): string | undefined => TEXT.skills[key]?.descEs;
export const itemName = (key: string): string => TEXT.items[key]?.es ?? key;
export const itemNameEn = (key: string): string => TEXT.items[key]?.en ?? key;
export const itemDescriptionText = (key: string): string | undefined => TEXT.items[key]?.descEs;

/** Texto sin tildes y en minúsculas, para buscar. */
export const normalize = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** ¿La búsqueda coincide con el nombre en español, en inglés o el interno? */
export function matches(query: string, ...names: string[]): boolean {
  const q = normalize(query.trim());
  return !q || names.some((n) => normalize(n).includes(q));
}

export const personaMatches = (p: Pick<Persona, 'name'>, query: string) =>
  matches(query, personaName(p), personaNameEn(p), p.name);
export const skillMatches = (key: string, query: string) => matches(query, skillName(key), skillNameEn(key), key);

const collator = new Intl.Collator('es', { ignorePunctuation: true });
export const byPersonaName = (a: Pick<Persona, 'name'>, b: Pick<Persona, 'name'>) =>
  collator.compare(personaName(a), personaName(b));
export const bySkillName = (a: string, b: string) => collator.compare(skillName(a), skillName(b));
