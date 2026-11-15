import itemsJson from '../data/generated/items.json';
import type { ItemInfo, ItemOwner, ItemType, Persona, SkillElement, SkillInfo } from '../types';
import { getAllPersonas, getAllSkills, getSkill } from './personas';
import { L, bilingual, tr } from '../../../i18n';
import { describeCost, skillMeta } from './skillText';
import { itemDescriptionText, skillName, normalize, personaName, personaNameEn, skillMatches, bySkillName } from './gameText';

const ITEMS = itemsJson as unknown as Record<string, ItemInfo>;

export function getItem(name: string | null | undefined): ItemInfo | undefined {
  return name ? ITEMS[name] : undefined;
}

export const OWNER_LABEL: Record<ItemOwner, string> = {
  joker: 'Joker', skull: 'Skull', mona: 'Mona', panther: 'Panther', fox: 'Fox',
  queen: 'Queen', noir: 'Noir', crow: 'Crow', violet: 'Violet',
};

const GENDER_LABEL = bilingual(
  { male: 'masculina', female: 'femenina', unisex: 'unisex', morgana: 'solo Morgana' },
  { male: '(male)', female: '(female)', unisex: '(unisex)', morgana: '(Morgana only)' },
);

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
      return it.owner ? `${L('Arma cuerpo a cuerpo', 'Melee weapon')} · ${OWNER_LABEL[it.owner]}` : L('Arma cuerpo a cuerpo', 'Melee weapon');
    case 'gun':
      return it.owner ? `${L('Arma de fuego', 'Gun')} · ${OWNER_LABEL[it.owner]}` : L('Arma de fuego', 'Gun');
    case 'armor':
      return it.gender ? `${L('Armadura', 'Armor')} ${GENDER_LABEL[it.gender]}` : L('Armadura', 'Armor');
    case 'accessory':
      return L('Accesorio', 'Accessory');
    case 'skillcard':
      return 'Skill card';
    default:
      return L('Equipo (tipo a confirmar)', 'Equipment (type to be confirmed)');
  }
}

export interface ItemLine {
  text: string;
  cost?: ReturnType<typeof describeCost>;
}

/** Líneas cortas para el recuadro que aparece al pasar el mouse. */
export function itemDescription(it: ItemInfo): { lines: ItemLine[]; note?: string } {
  const official = itemDescriptionText(it.name);
  if (it.type === 'skillcard' || it.type === 'accessory') {
    const skill = it.skill ? getSkill(it.skill) : undefined;
    const verb = it.type === 'skillcard' ? L('Enseña', 'Teaches') : L('Permite usar', 'Lets you use');
    const meta = skill ? skillMeta(skill) : '';
    const name = it.skill ? skillName(it.skill) : '';
    return {
      lines: [
        ...(official && it.type === 'accessory' ? [{ text: official }] : []),
        {
          text: `${verb} ${name}${meta ? ` (${meta})` : ''}${it.type === 'accessory' ? L(' a quien lo equipe', ' to whoever equips it') : L(' a una Persona', ' to a Persona')}.`,
          cost: skill ? describeCost(skill) : undefined,
        },
      ],
    };
  }
  const lines: ItemLine[] = official ? [{ text: official }] : [];
  const s = it.stats ?? {};
  const nums = [
    s.attack !== undefined && `${L('Ataque', 'Attack')} ${s.attack}`,
    s.defense !== undefined && `${L('Defensa', 'Defense')} ${s.defense}`,
    s.accuracy !== undefined && `${L('Precisión', 'Accuracy')} ${s.accuracy}`,
    s.evasion !== undefined && `${L('Evasión', 'Evasion')} ${s.evasion}`,
    s.rounds !== undefined && `${L('Balas', 'Rounds')} ${s.rounds}`,
  ].filter(Boolean) as string[];
  if (nums.length) lines.push({ text: nums.join(' · ') });
  for (const e of it.effects ?? []) lines.push({ text: tr(e) });

  let note: string | undefined;
  if (it.type === 'unknown') note = L('Item de Royal: falta confirmar tipo y estadísticas.', 'Royal item: type and stats still to be confirmed.');
  else if (it.source === 'juego') note = L('Comprobado en el juego.', 'Checked in the game.');
  else if (it.variantOf) note = L(`Versión mejorada de ${it.variantOf}: faltan sus estadísticas.`, `Upgraded version of ${it.variantOf}: stats missing.`);
  else if (it.p5Stats) note = L('Estadísticas de P5 original: pueden variar en Royal.', 'Original P5 stats: they may differ in Royal.');
  if (lines.length <= (official ? 1 : 0) && !note) note = L('Sin datos todavía.', 'No data yet.');
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

/** all = todas · normal = sale ejecutando sin alarma · alarm = con la Alarma de fusión · excl = exclusiva */
export type SkillCardFilter = 'all' | 'normal' | 'alarm' | 'excl';

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
      learners: (learners.get(skill.name) ?? []).slice().sort((a, b) => a.level - b.level || personaName(a).localeCompare(personaName(b), 'es')),
    }))
    .sort((a, b) => bySkillName(a.skill.name, b.skill.name));
  return rows;
}


export function filterSkillCardRows(
  list: SkillCardRow[],
  f: { query: string; type: SkillCardFilter; element: SkillElement | null },
): SkillCardRow[] {
  const q = normalize(f.query.trim());
  const pm = (p: Persona) => normalize(personaName(p)).includes(q) || normalize(personaNameEn(p)).includes(q);
  return list.filter((r) => {
    if (f.element && r.skill.element !== f.element) return false;
    if (f.type === 'normal' && !r.cards.some((c) => !c.alarm)) return false;
    if (f.type === 'alarm' && !r.cards.some((c) => c.alarm)) return false;
    if (f.type === 'excl' && !r.exclusive) return false;
    if (!q) return true;
    return (
      skillMatches(r.skill.name, f.query) ||
      r.cards.some((c) => pm(c.persona)) ||
      r.learners.some(pm)
    );
  });
}

/** Elementos sin daño: no se ordenan por daño. */
export const NO_DAMAGE: ReadonlySet<SkillElement> = new Set(['rec', 'sup', 'pas', 'ail', 'tra'] as SkillElement[]);

/** Ordena una COPIA por daño (las que no tienen dato de daño van al final). */
export function sortByPower(list: SkillCardRow[], dir: 'desc' | 'asc'): SkillCardRow[] {
  const sign = dir === 'desc' ? -1 : 1;
  return [...list].sort((x, y) => {
    const a = x.skill.power ?? null;
    const b = y.skill.power ?? null;
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return sign * (a - b);
  });
}
