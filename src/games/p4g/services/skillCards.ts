import { P4G_PERSONAS } from '../fusion';
import type { Persona, SkillInfo } from '../types';
import { SKILLS, personaName, skillName } from './text';

export type CardFilter = 'all' | 'cafe' | 'shuffle' | 'excl';

export interface SkillCardRow {
  skill: SkillInfo;
  /** Persona que la da en la Cafetería Chagall */
  cafe: Persona | null;
  /** Personas que la aprenden por nivel (sin compañeros) */
  learners: Persona[];
  /** No existe como skill card */
  exclusive: boolean;
}

const byName = new Map(P4G_PERSONAS.map((p) => [p.name, p]));
const fusable = P4G_PERSONAS.filter((p) => !p.party);

let rows: SkillCardRow[] | null = null;
/** Todas las habilidades que alguna Persona aprende, con su skill card si existe. */
export function getSkillCardRows(): SkillCardRow[] {
  if (rows) return rows;
  rows = Object.values(SKILLS)
    .map((skill) => ({
      skill,
      cafe: skill.cafe ? byName.get(skill.cafe) ?? null : null,
      learners: fusable.filter((p) => p.skills.some((s) => s.skill === skill.name)).sort((a, b) => a.level - b.level),
      exclusive: !skill.card,
    }))
    .filter((r) => r.skill.card || r.learners.length > 0)
    .sort((a, b) => a.skill.id - b.skill.id);
  return rows;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function filterRows(list: SkillCardRow[], f: { query: string; type: CardFilter; element: string | null }): SkillCardRow[] {
  const q = norm(f.query.trim());
  return list.filter((r) => {
    if (f.type === 'cafe' && !r.cafe) return false;
    if (f.type === 'shuffle' && (r.exclusive || r.cafe)) return false;
    if (f.type === 'excl' && !r.exclusive) return false;
    if (f.element && r.skill.element !== f.element) return false;
    if (!q) return true;
    const names = [r.skill.name, r.skill.nameEn, skillName(r.skill.name), ...(r.cafe ? [personaName(r.cafe)] : [])];
    return names.some((n) => norm(n).includes(q));
  });
}
