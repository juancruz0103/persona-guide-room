import type { Affinity, AilmentId, ResistElement, SkillElement } from '../types';
import { L } from '../../../i18n';

/** Las 10 afinidades de Reload en el orden del juego. */
export const RESIST_ORDER: ResistElement[] = ['sla', 'str', 'pie', 'fir', 'ice', 'ele', 'win', 'lig', 'dar', 'alm'];

/** Grupos para la ficha: físicos, elementales y luz/oscuridad. */
export const RESIST_GROUPS: { label: () => string; ids: ResistElement[] }[] = [
  { label: () => L('Físicos', 'Physical'), ids: ['sla', 'str', 'pie'] },
  { label: () => L('Elementales', 'Elemental'), ids: ['fir', 'ice', 'ele', 'win'] },
  { label: () => L('Luz y oscuridad', 'Light and dark'), ids: ['lig', 'dar'] },
  { label: () => L('Todopoderoso', 'Almighty'), ids: ['alm'] },
];

/** Nombres oficiales de la versión en español del juego. */
const ELEMENTS: Record<SkillElement, { es: string; short: string; en: string; color: string }> = {
  sla: { es: 'Corte', short: 'Corte', en: 'Slash', color: '#C9D4E5' },
  str: { es: 'Golpe', short: 'Golpe', en: 'Strike', color: '#C9D4E5' },
  pie: { es: 'Perforación', short: 'Perfor.', en: 'Pierce', color: '#C9D4E5' },
  fir: { es: 'Fuego', short: 'Fuego', en: 'Fire', color: '#EE4130' },
  ice: { es: 'Hielo', short: 'Hielo', en: 'Ice', color: '#3BB2F0' },
  ele: { es: 'Electricidad', short: 'Elec.', en: 'Electric', color: '#F7E23B' },
  win: { es: 'Viento', short: 'Viento', en: 'Wind', color: '#82DC5A' },
  lig: { es: 'Sagrado', short: 'Sagrado', en: 'Light', color: '#FFF3B0' },
  dar: { es: 'Oscuridad', short: 'Oscur.', en: 'Dark', color: '#B06CF0' },
  alm: { es: 'Todopoderoso', short: 'Todop.', en: 'Almighty', color: '#FFFFFF' },
  ail: { es: 'Estado alterado', short: 'Estado', en: 'Ailment', color: '#E86FB6' },
  rec: { es: 'Curar', short: 'Curar', en: 'Healing', color: '#5CF4F6' },
  sup: { es: 'Apoyo', short: 'Apoyo', en: 'Support', color: '#4C9DF0' },
  pas: { es: 'Pasiva', short: 'Pasiva', en: 'Passive', color: '#F9EE48' },
};

export const elementName = (id: SkillElement) => L(ELEMENTS[id].es, ELEMENTS[id].en);
export const elementShort = (id: SkillElement) => L(ELEMENTS[id].short, ELEMENTS[id].en);
export const elementColor = (id: SkillElement) => ELEMENTS[id].color;

const AFFINITY: Record<Affinity, { es: string; en: string }> = {
  weak: { es: 'Déb', en: 'Wk' },
  neutral: { es: '—', en: '—' },
  resist: { es: 'Res', en: 'Res' },
  null: { es: 'Anu', en: 'Nul' },
  repel: { es: 'Ref', en: 'Rpl' },
  drain: { es: 'Abs', en: 'Drn' },
};
const AFFINITY_LONG: Record<Affinity, { es: string; en: string }> = {
  weak: { es: 'Débil', en: 'Weak' },
  neutral: { es: 'Normal', en: 'Normal' },
  resist: { es: 'Resiste', en: 'Resists' },
  null: { es: 'Anula', en: 'Nullifies' },
  repel: { es: 'Refleja', en: 'Repels' },
  drain: { es: 'Absorbe', en: 'Drains' },
};
export const affinityShort = (a: Affinity) => L(AFFINITY[a].es, AFFINITY[a].en);
export const affinityLong = (a: Affinity) => L(AFFINITY_LONG[a].es, AFFINITY_LONG[a].en);

/** Estados alterados de Reload (nombres oficiales en español). */
const AILMENTS: Record<AilmentId, { es: string; en: string }> = {
  charm: { es: 'Encanto', en: 'Charm' },
  poison: { es: 'Veneno', en: 'Poison' },
  distress: { es: 'Angustia', en: 'Distress' },
  confuse: { es: 'Confusión', en: 'Confuse' },
  fear: { es: 'Miedo', en: 'Fear' },
  rage: { es: 'Furia', en: 'Rage' },
};
export const ailmentName = (id: AilmentId) => L(AILMENTS[id].es, AILMENTS[id].en);

/** Tipos de herencia: qué elementos NO puede heredar cada Persona. */
const INHERIT_ELEMS = ['sla', 'str', 'pie', 'fir', 'ice', 'ele', 'win', 'lig', 'dar', 'ail', 'rec', 'sup'] as const;
export { INHERIT_ELEMS };
