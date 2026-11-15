import namesJson from '../data/generated/names-es.json';
import descJson from '../data/generated/descriptions-es.json';
import skillsJson from '../data/generated/skills.json';
import type { Persona, SkillInfo } from '../types';
import { L } from '../../../i18n';

const NAMES = namesJson as { items: Record<string, string> };
const DESC = descJson as { skills: Record<string, string>; personas: Record<string, string> };
export const SKILLS = skillsJson as unknown as Record<string, SkillInfo>;

export const personaName = (p: Persona) => L(p.nameEs ?? p.name, p.name);
export const skillName = (name: string) => L(SKILLS[name]?.nameEs ?? name, name);
export const itemName = (name: string) => L(NAMES.items[name.replace('’', "'")] ?? name, name);
/** Descripción oficial (texto del juego en español). */
export const skillDescription = (name: string): string | null => DESC.skills[name] ?? DESC.skills[name.replace(/ [A-Z]$/, '')] ?? null;
export const personaMyth = (p: Persona): string | null => DESC.personas[p.name] ?? null;
export const getSkill = (name: string): SkillInfo | undefined => SKILLS[name];
