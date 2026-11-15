import gameTextJson from '../data/generated/game-text.json';
import type { Persona } from '../types';
import { isEn } from '../../../i18n';

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
  /** Personas: texto de mitología del compendio */
  mythEs?: string;
  mythEn?: string;
}
const TEXT = gameTextJson as unknown as {
  skills: Record<string, Text>;
  personas: Record<string, Text>;
  items: Record<string, Text>;
};

// Nombre en el idioma actual (…Name) y en el OTRO idioma (…NameEn, que en inglés devuelve el español).
const pick = (t: Text | undefined, fallback: string, other = false): string =>
  !t ? fallback : isEn() !== other ? t.en ?? fallback : t.es ?? fallback;
export const personaName = (p: Pick<Persona, 'name'>): string => pick(TEXT.personas[p.name], p.name);
export const personaNameEn = (p: Pick<Persona, 'name'>): string => pick(TEXT.personas[p.name], p.name, true);
/** Origen de la Persona (texto oficial del compendio del juego). */
export const personaMyth = (p: Pick<Persona, 'name'>): string | undefined =>
  isEn() ? TEXT.personas[p.name]?.mythEn ?? TEXT.personas[p.name]?.mythEs : TEXT.personas[p.name]?.mythEs;
export const skillName = (key: string): string => pick(TEXT.skills[key], key);
export const skillNameEn = (key: string): string => pick(TEXT.skills[key], key, true);
export const skillDescription = (key: string): string | undefined =>
  isEn() ? TEXT.skills[key]?.descEn ?? TEXT.skills[key]?.descEs : TEXT.skills[key]?.descEs;
export const itemName = (key: string): string => pick(TEXT.items[key], key);
export const itemNameEn = (key: string): string => pick(TEXT.items[key], key, true);
export const itemDescriptionText = (key: string): string | undefined =>
  isEn() ? TEXT.items[key]?.descEn ?? TEXT.items[key]?.descEs : TEXT.items[key]?.descEs;

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
