import itemsJson from '../data/generated/items.json';
import type { ItemInfo, ItemOwner, ItemType, Persona, SkillElement, SkillInfo } from '../types';
import { getAllPersonas, getAllSkills, getSkill } from './personas';
import { describeCost, skillMeta } from './skillText';

const ITEMS = itemsJson as unknown as Record<string, ItemInfo>;

export function getItem(name: string | null | undefined): ItemInfo | undefined {
  return name ? ITEMS[name] : undefined;
}

export const OWNER_LABEL: Record<ItemOwner, string> = {
  joker: 'Joker', skull: 'Skull', mona: 'Mona', panther: 'Panther', fox: 'Fox',
  queen: 'Queen', noir: 'Noir', crow: 'Crow', violet: 'Violet',
};

const GENDER_LABEL = { male: 'masculina', female: 'femenina', unisex: 'unisex', morgana: 'solo Morgana' } as const;

/** Material que hace falta en el Velvet Room para cada tipo de item. */
export const MATERIAL: Partial<Record<ItemType, string>> = {
  melee: 'Black Kogatana',
  gun: 'Model Gun',
  armor: 'Black Robe',
  accessory: 'Black Rock',
  skillcard: 'Blank Card',
};

export function itemTypeLabel(it: ItemInfo): string {
  switch (it.type) {
    case 'melee':
      return it.owner ? `Arma cuerpo a cuerpo · ${OWNER_LABEL[it.owner]}` : 'Arma cuerpo a cuerpo';
    case 'gun':
      return it.owner ? `Arma de fuego · ${OWNER_LABEL[it.owner]}` : 'Arma de fuego';
    case 'armor':
      return it.gender ? `Armadura ${GENDER_LABEL[it.gender]}` : 'Armadura';
    case 'accessory':
      return 'Accesorio';
    case 'skillcard':
      return 'Skill card';
    default:
      return 'Equipo (tipo a confirmar)';
  }
}

export interface ItemLine {
  text: string;
  cost?: ReturnType<typeof describeCost>;
}

/** Líneas cortas para el recuadro que aparece al pasar el mouse. */
export function itemDescription(it: ItemInfo): { lines: ItemLine[]; note?: string } {
  if (it.type === 'skillcard' || it.type === 'accessory') {
    const skill = it.skill ? getSkill(it.skill) : undefined;
    const verb = it.type === 'skillcard' ? 'Enseña' : 'Permite usar';
    const meta = skill ? skillMeta(skill) : '';
    return {
      lines: [
        {
          text: `${verb} ${it.skill}${meta ? ` (${meta})` : ''}${it.type === 'accessory' ? ' a quien lo equipe' : ' a una Persona'}.`,
          cost: skill ? describeCost(skill) : undefined,
        },
      ],
    };
  }
  const lines: ItemLine[] = [];
  const s = it.stats ?? {};
  const nums = [
    s.attack !== undefined && `Ataque ${s.attack}`,
    s.defense !== undefined && `Defensa ${s.defense}`,
    s.accuracy !== undefined && `Precisión ${s.accuracy}`,
    s.evasion !== undefined && `Evasión ${s.evasion}`,
    s.rounds !== undefined && `Balas ${s.rounds}`,
  ].filter(Boolean) as string[];
  if (nums.length) lines.push({ text: nums.join(' · ') });
  for (const e of it.effects ?? []) lines.push({ text: e });

  let note: string | undefined;
  if (it.type === 'unknown') note = 'Item de Royal: falta confirmar tipo y estadísticas.';
  else if (it.variantOf) note = `Versión mejorada de ${it.variantOf}: faltan sus estadísticas.`;
  else if (it.p5Stats) note = 'Estadísticas de P5 original: pueden variar en Royal.';
  if (!lines.length && !note) note = 'Sin datos todavía.';
  return { lines, note };
}

/* ---------- Skill cards ---------- */

export interface SkillCardSource {
  persona: Persona;
  alarm: boolean;
}

let cardIndex: Map<string, SkillCardSource[]> | null = null;

/** Qué Personas dan cada skill card (normal o con Alarma de fusión). */
export function skillCardSources(skill: string): SkillCardSource[] {
  if (!cardIndex) {
    cardIndex = new Map();
    for (const p of getAllPersonas()) {
      for (const [name, alarm] of [[p.itemization, false], [p.itemizationAlt, true]] as const) {
        if (!name || getItem(name)?.type !== 'skillcard') continue;
        const list = cardIndex.get(name) ?? [];
        list.push({ persona: p, alarm });
        cardIndex.set(name, list);
      }
    }
    for (const list of cardIndex.values()) list.sort((a, b) => Number(a.alarm) - Number(b.alarm) || a.persona.level - b.persona.level);
  }
  return cardIndex.get(skill) ?? [];
}

export type SkillCardFilter = 'all' | 'card' | 'alarm' | 'excl';

export interface SkillCardRow {
  skill: SkillInfo;
  /** Exclusiva de Persona: no existe como skill card */
  exclusive: boolean;
  cards: SkillCardSource[];
  /** Personas que la aprenden subiendo de nivel (o la traen de inicio) */
  learners: Persona[];
}

let rows: SkillCardRow[] | null = null;

/** Todas las skills (sin rasgos), con quién da su skill card y quién la aprende. */
export function getSkillCardRows(): SkillCardRow[] {
  if (rows) return rows;
  const learners = new Map<string, Persona[]>();
  for (const p of getAllPersonas()) {
    for (const s of p.skills ?? []) {
      const list = learners.get(s.skill) ?? [];
      list.push(p);
      learners.set(s.skill, list);
    }
  }
  rows = getAllSkills()
    .filter((s) => s.element !== 'tra')
    .map((skill) => ({
      skill,
      exclusive: !!skill.unique,
      cards: skillCardSources(skill.name),
      learners: (learners.get(skill.name) ?? []).slice().sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name));
  return rows;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filterSkillCardRows(
  list: SkillCardRow[],
  f: { query: string; type: SkillCardFilter; element: SkillElement | null },
): SkillCardRow[] {
  const q = norm(f.query.trim());
  return list.filter((r) => {
    if (f.element && r.skill.element !== f.element) return false;
    if (f.type === 'card' && !r.cards.length) return false;
    if (f.type === 'alarm' && !r.cards.some((c) => c.alarm)) return false;
    if (f.type === 'excl' && !r.exclusive) return false;
    if (!q) return true;
    return (
      norm(r.skill.name).includes(q) ||
      r.cards.some((c) => norm(c.persona.name).includes(q)) ||
      r.learners.some((p) => norm(p.name).includes(q))
    );
  });
}
