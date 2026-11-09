import type { SkillInfo } from '../types';
import { AILMENTS, ELEMENTS, technicalFor } from '../data/elements';

export const TARGET_LABEL = {
  one: '1 enemigo', all: 'Todos', ally: '1 aliado', party: 'Grupo', self: 'Uno mismo', everyone: 'Todos',
} as const;

/** Costo de una skill: "22 SP" o "16% HP", con el tipo para pintarlo del color correcto. */
export function describeCost(skill: SkillInfo): { text: string; kind: 'hp' | 'sp' } | undefined {
  if (!skill.cost) return undefined;
  return skill.cost.type === 'hp'
    ? { text: `${skill.cost.value}% HP`, kind: 'hp' }
    : { text: `${skill.cost.value} SP`, kind: 'sp' };
}

/** "Hielo · Todos" (sin el costo, que se muestra aparte con color). */
export function skillMeta(skill: SkillInfo): string {
  const el = skill.element !== 'tra' ? ELEMENTS[skill.element].name : 'Rasgo';
  const target = skill.target && skill.element !== 'pas' ? TARGET_LABEL[skill.target] : '';
  return [el, target].filter(Boolean).join(' · ');
}

/** Elementos con los que se hace Técnico contra el estado que causa la skill. */
export function techText(skill: SkillInfo): string {
  if (!skill.ailment) return '';
  const rule = technicalFor(skill.ailment);
  if (!rule) return 'sin datos en la tabla';
  if (rule.base.includes('any')) return 'cualquier elemento';
  const names = rule.base.map((e) => ELEMENTS[e as keyof typeof ELEMENTS].name);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} o ${names[names.length - 1]}` : names[0];
}

export function ailmentText(skill: SkillInfo): string {
  if (!skill.ailment) return '';
  const a = AILMENTS[skill.ailment];
  return `${a.es} (${a.en})`;
}
