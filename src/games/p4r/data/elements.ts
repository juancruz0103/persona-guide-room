import type { Affinity, ResistElement, SkillElement } from '../types';
import { L } from '../../../i18n';

/** Las 8 afinidades de Persona 4 Revival en el orden del juego. */
export const RESIST_ORDER: ResistElement[] = ['phy', 'fir', 'ice', 'ele', 'win', 'lig', 'dar', 'alm'];

export const RESIST_GROUPS: { label: () => string; ids: ResistElement[] }[] = [
  { label: () => L('Físico', 'Physical'), ids: ['phy'] },
  { label: () => L('Elementales', 'Elemental'), ids: ['fir', 'ice', 'ele', 'win'] },
  { label: () => L('Luz y oscuridad', 'Light and dark'), ids: ['lig', 'dar'] },
];

const ELEMENTS: Record<SkillElement, { es: string; short: string; en: string; color: string }> = {
  phy: { es: 'Físico', short: 'Físico', en: 'Physical', color: '#E9D6A0' },
  fir: { es: 'Fuego', short: 'Fuego', en: 'Fire', color: '#EE4130' },
  ice: { es: 'Hielo', short: 'Hielo', en: 'Ice', color: '#3BB2F0' },
  ele: { es: 'Eléctrico', short: 'Eléc.', en: 'Electric', color: '#F7E23B' },
  win: { es: 'Viento', short: 'Viento', en: 'Wind', color: '#82DC5A' },
  lig: { es: 'Luz', short: 'Luz', en: 'Light', color: '#FFF3B0' },
  dar: { es: 'Oscuridad', short: 'Oscur.', en: 'Dark', color: '#B06CF0' },
  alm: { es: 'Todopoderoso', short: 'Todop.', en: 'Almighty', color: '#FFFFFF' },
  ail: { es: 'Estado alterado', short: 'Estado', en: 'Ailment', color: '#E86FB6' },
  rec: { es: 'Curación', short: 'Curar', en: 'Healing', color: '#7CE38B' },
  sup: { es: 'Apoyo', short: 'Apoyo', en: 'Support', color: '#4C9DF0' },
  pas: { es: 'Pasiva', short: 'Pasiva', en: 'Passive', color: '#D6B65C' },
};

export const elementName = (id: SkillElement) => L(ELEMENTS[id].es, ELEMENTS[id].en);
export const elementShort = (id: SkillElement) => L(ELEMENTS[id].short, ELEMENTS[id].en);
export const elementColor = (id: SkillElement) => ELEMENTS[id].color;

const AFFINITY: Record<Affinity, { es: string; en: string }> = {
  weak: { es: 'Déb', en: 'Wk' }, neutral: { es: '—', en: '—' }, resist: { es: 'Res', en: 'Res' },
  null: { es: 'Anu', en: 'Nul' }, repel: { es: 'Ref', en: 'Rpl' }, drain: { es: 'Abs', en: 'Drn' },
};
const AFFINITY_LONG: Record<Affinity, { es: string; en: string }> = {
  weak: { es: 'Débil', en: 'Weak' }, neutral: { es: 'Normal', en: 'Normal' }, resist: { es: 'Resiste', en: 'Resists' },
  null: { es: 'Anula', en: 'Nullifies' }, repel: { es: 'Refleja', en: 'Repels' }, drain: { es: 'Absorbe', en: 'Drains' },
};
export const affinityShort = (a: Affinity) => L(AFFINITY[a].es, AFFINITY[a].en);
export const affinityLong = (a: Affinity) => L(AFFINITY_LONG[a].es, AFFINITY_LONG[a].en);

/** Estados alterados de P4R. */
const AILMENTS: Record<string, { es: string; en: string }> = {
  panic: { es: 'Pánico', en: 'Panic' }, poison: { es: 'Veneno', en: 'Poison' }, fear: { es: 'Miedo', en: 'Fear' },
  rage: { es: 'Furia', en: 'Rage' }, dizzy: { es: 'Mareo', en: 'Dizzy' }, exhaustion: { es: 'Agotamiento', en: 'Exhaustion' },
  enervation: { es: 'Enervación', en: 'Enervation' }, mute: { es: 'Silencio', en: 'Mute' }, confusion: { es: 'Confusión', en: 'Confusion' },
};
export const ailmentName = (id: string) => (AILMENTS[id] ? L(AILMENTS[id].es, AILMENTS[id].en) : id);
