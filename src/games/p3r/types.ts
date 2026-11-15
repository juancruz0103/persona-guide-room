/**
 * Modelo de datos de Persona 3 Reload.
 * Distinto de Royal: 3 tipos de físico (corte, golpe y perforación), luz "sagrada",
 * sin psicoquinesis, nuclear ni pistola. No hay silla eléctrica: cada Persona da un
 * objeto de corazón al llegar a cierto nivel.
 */
export type ArcanaId =
  | 'fool' | 'magician' | 'priestess' | 'empress' | 'emperor' | 'hierophant'
  | 'lovers' | 'chariot' | 'justice' | 'hermit' | 'fortune' | 'strength'
  | 'hanged' | 'death' | 'temperance' | 'devil' | 'tower' | 'star' | 'moon'
  | 'sun' | 'judgement' | 'aeon';

/** Las 10 afinidades de Reload, en el orden del juego. */
export type ResistElement = 'sla' | 'str' | 'pie' | 'fir' | 'ice' | 'ele' | 'win' | 'lig' | 'dar' | 'alm';
export type SkillElement = ResistElement | 'ail' | 'rec' | 'sup' | 'pas';
export type Affinity = 'weak' | 'neutral' | 'resist' | 'null' | 'repel' | 'drain';
export type AilmentId = 'charm' | 'poison' | 'distress' | 'confuse' | 'fear' | 'rage';

export interface PersonaSkill {
  skill: string;
  /** null = inicial */
  level: number | null;
  /** 'special' = se aprende de otra forma (Teúrgia, vínculo, etc.) */
  note?: string;
}

export type UnlockCondition =
  | { type: 'link'; arcana: ArcanaId }
  | { type: 'allLinks' }
  | { type: 'teammate'; who: string }
  | { type: 'dlc'; pack: string }
  | { type: 'request'; number: number }
  | { type: 'tartarus'; block: string; floor: number }
  | { type: 'story'; detail: string };

export interface Persona {
  id: string;
  /** Nombre en inglés (clave interna) */
  name: string;
  /** Nombre oficial en español */
  nameEs: string | null;
  arcana: ArcanaId;
  level: number;
  flags: { dlc: boolean; special: boolean };
  specialRecipe: string[] | null;
  unlock: UnlockCondition | null;
  resistances: Record<ResistElement, Affinity>;
  stats: { st: number; ma: number; en: number; ag: number; lu: number };
  skills: PersonaSkill[];
  inheritance: string | null;
  heart: { item: string; level: number } | null;
  party?: { owner: string | null };
}

export interface SkillInfo {
  name: string;
  nameEs: string | null;
  element: SkillElement;
  target: 'one' | 'all' | 'ally' | 'party' | 'self' | 'everyone' | null;
  ailment: AilmentId | null;
  cost: { type: 'sp' | 'hp'; value: number } | null;
  power: number | null;
  unique: boolean;
  /** Carta de Shuffle Time que la enseña, si existe */
  card: string | null;
}
