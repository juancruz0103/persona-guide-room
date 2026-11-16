import namesJson from '../data/generated/names-es.json';
import descJson from '../data/generated/descriptions-es.json';
import descEnJson from '../data/generated/descriptions-en.json';
import skillsJson from '../data/generated/skills.json';
import type { Persona, SkillInfo } from '../types';
import { L, isEn } from '../../../i18n';

const NAMES = namesJson as { items: Record<string, string> };
type Desc = { skills: Record<string, string>; personas: Record<string, string>; hearts?: Record<string, string> };
const DESC_ES = descJson as Desc;
export const DESC_EN = descEnJson as Desc;
const desc = () => (isEn() ? DESC_EN : DESC_ES);
export const SKILLS = skillsJson as unknown as Record<string, SkillInfo>;

export const personaName = (p: Persona) => L(p.nameEs ?? p.name, p.name);
export const skillName = (name: string) => L(SKILLS[name]?.nameEs ?? name, name);
export const itemName = (name: string) => L(NAMES.items[name.replace('’', "'")] ?? name, name);
/** Descripción oficial (texto del juego en el idioma de la web). */
export const skillDescription = (name: string): string | null => desc().skills[name] ?? desc().skills[name.replace(/ [A-Z]$/, '')] ?? null;
export const personaMyth = (p: Persona): string | null => desc().personas[p.name] ?? null;
export const getSkill = (name: string): SkillInfo | undefined => SKILLS[name];

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const personaMatches = (p: Persona, q: string) => [p.nameEs ?? '', p.name].some((s) => strip(s).includes(strip(q.trim())));
const collator = new Intl.Collator('es', { ignorePunctuation: true });
export const bySkillName = (a: string, b: string) => collator.compare(skillName(a), skillName(b));
