import gameText from '../data/generated/game-text.json';
import skillsJson from '../data/generated/skills.json';
import type { Persona, SkillInfo } from '../types';
import { L } from '../../../i18n';

export const SKILLS = skillsJson as unknown as Record<string, SkillInfo>;
const HELP = (gameText as { skillHelp: Record<string, { es: string; en: string }> }).skillHelp;

export const personaName = (p: Persona) => L(p.nameEs ?? p.nameEn, p.nameEn);
export const skillName = (name: string) => L(SKILLS[name]?.nameEs ?? SKILLS[name]?.nameEn ?? name, SKILLS[name]?.nameEn ?? name);
/** Descripción oficial (texto del juego en el idioma de la web). */
export function skillDescription(name: string): string | null {
  const s = SKILLS[name];
  const h = s ? HELP[String(s.id)] : undefined;
  const text = h ? L(h.es, h.en) : '';
  return text && !/^Skill[0-9A-F]+$/i.test(text) ? text : null;
}
export const getSkill = (name: string): SkillInfo | undefined => SKILLS[name];

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const personaMatches = (p: Persona, q: string) =>
  [p.nameEs ?? '', p.nameEn, p.name].some((s) => strip(s).includes(strip(q.trim())));
const collator = new Intl.Collator('es', { ignorePunctuation: true });
export const bySkillName = (a: string, b: string) => collator.compare(skillName(a), skillName(b));
