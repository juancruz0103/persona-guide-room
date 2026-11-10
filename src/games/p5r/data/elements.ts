import type { AilmentId, ResistElement, SkillElement, TechnicalRule, Affinity } from '../types';

export interface ElementInfo {
  id: SkillElement;
  name: string;
  color: string;
  /** Descripción propia (no copiada del juego) */
  description: string;
}

export const RESIST_ORDER: ResistElement[] = [
  'phy', 'gun', 'fir', 'ice', 'ele', 'win', 'psy', 'nuk', 'ble', 'cur',
];

export const ELEMENTS: Record<SkillElement, ElementInfo> = {
  phy: { id: 'phy', name: 'Físico', color: '#F28C28', description: 'Golpe cuerpo a cuerpo. Consume HP en lugar de SP y puede dar golpes críticos.' },
  gun: { id: 'gun', name: 'Arma', color: '#F2B134', description: 'Disparo con el arma de fuego. Consume HP y puede dar golpes críticos.' },
  fir: { id: 'fir', name: 'Fuego', color: '#EE4130', description: 'Ataque mágico de fuego. Algunas habilidades pueden quemar al enemigo.' },
  ice: { id: 'ice', name: 'Hielo', color: '#3BB2F0', description: 'Ataque mágico de hielo. Algunas habilidades pueden congelar al enemigo.' },
  ele: { id: 'ele', name: 'Eléctrico', color: '#F7E23B', description: 'Ataque mágico eléctrico. Algunas habilidades pueden electrocutar al enemigo.' },
  win: { id: 'win', name: 'Viento', color: '#82DC5A', description: 'Ataque mágico de viento.' },
  psy: { id: 'psy', name: 'Psi', color: '#DA66EA', description: 'Ataque psíquico. Es clave para los Técnicos con estados mentales.' },
  nuk: { id: 'nuk', name: 'Nuclear', color: '#45DDE4', description: 'Ataque nuclear. Hace Técnico contra enemigos quemados, congelados o electrocutados.' },
  ble: { id: 'ble', name: 'Bendición', color: '#F8EFB8', description: 'Ataque de luz. Incluye habilidades de muerte instantánea.' },
  cur: { id: 'cur', name: 'Maldición', color: '#FF5468', description: 'Ataque de oscuridad. Incluye habilidades de muerte instantánea.' },
  alm: { id: 'alm', name: 'Todopoderoso', color: '#F5F5F0', description: 'Daño puro: casi ningún enemigo lo resiste.' },
  ail: { id: 'ail', name: 'Estado alterado', color: '#B866EE', description: 'Provoca estados alterados en el enemigo sin hacer daño.' },
  rec: { id: 'rec', name: 'Curación', color: '#5FE08A', description: 'Recupera HP o cura estados alterados del grupo.' },
  sup: { id: 'sup', name: 'Apoyo', color: '#4C7DF0', description: 'Mejora al grupo o debilita a los enemigos.' },
  pas: { id: 'pas', name: 'Pasiva', color: '#EBD25A', description: 'Efecto permanente: se activa solo, sin gastar turno ni SP.' },
};

/** Nombres de estados: los oficiales de la versión en español del juego. */
export const AILMENTS: Record<AilmentId, { es: string; en: string }> = {
  burn: { es: 'Quemadura', en: 'Burn' },
  freeze: { es: 'Congelación', en: 'Freeze' },
  shock: { es: 'Electrificación', en: 'Shock' },
  dizzy: { es: 'Mareo', en: 'Dizzy' },
  sleep: { es: 'Sueño', en: 'Sleep' },
  forget: { es: 'Amnesia', en: 'Forget' },
  confuse: { es: 'Confusión', en: 'Confuse' },
  fear: { es: 'Miedo', en: 'Fear' },
  despair: { es: 'Desesperación', en: 'Despair' },
  rage: { es: 'Furia', en: 'Rage' },
  brainwash: { es: 'Manipulación', en: 'Brainwash' },
  hunger: { es: 'Hambre', en: 'Hunger' },
};

/** Tabla de Técnicos de P5R. Fuente: Megami Tensei Wiki, página "Technical". `knowingTheHeart`: extras del libro «Entender el corazón». */
export const TECHNICAL_CHART: TechnicalRule[] = [
  { ailment: 'burn', base: ['win', 'nuk'], knowingTheHeart: [] },
  { ailment: 'freeze', base: ['phy', 'gun', 'nuk'], knowingTheHeart: [] },
  { ailment: 'shock', base: ['phy', 'gun', 'nuk'], knowingTheHeart: [] },
  { ailment: 'dizzy', base: ['any'], knowingTheHeart: [] },
  { ailment: 'sleep', base: ['any'], knowingTheHeart: [] },
  { ailment: 'forget', base: ['psy'], knowingTheHeart: ['ele'] },
  { ailment: 'confuse', base: ['psy'], knowingTheHeart: ['gun', 'win'] },
  { ailment: 'fear', base: ['psy'], knowingTheHeart: ['ice'] },
  { ailment: 'despair', base: ['psy'], knowingTheHeart: ['cur'] },
  { ailment: 'rage', base: ['psy'], knowingTheHeart: ['fir'] },
  { ailment: 'brainwash', base: ['psy'], knowingTheHeart: ['ble'] },
];

export function technicalFor(ailment: AilmentId): TechnicalRule | undefined {
  return TECHNICAL_CHART.find((r) => r.ailment === ailment);
}

export const AFFINITY_LABEL: Record<Affinity, string> = {
  weak: 'Débil',
  neutral: '—',
  resist: 'Resiste',
  null: 'Nulo',
  repel: 'Refleja',
  drain: 'Absorbe',
};
