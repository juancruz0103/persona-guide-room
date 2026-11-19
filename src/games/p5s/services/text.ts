import skillsJson from '../data/generated/skills.json';
import type { Persona, SkillInfo } from '../types';
import { personaName, skillName } from './personas';
export { personaName, skillName };

export const SKILLS = skillsJson as unknown as Record<string, SkillInfo>;
const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const personaMatches = (p: Persona, q: string) =>
  [p.nameEs ?? '', p.nameEn, p.name].some((s) => strip(s).includes(strip(q.trim())));
const collator = new Intl.Collator('es', { ignorePunctuation: true });
export const bySkillName = (a: string, b: string) => collator.compare(skillName(a), skillName(b));
