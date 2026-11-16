/**
 * Modelo de datos de Persona 4 Golden.
 * 8 afinidades (físico, fuego, hielo, eléctrico, viento, luz, oscuridad, todopoderoso).
 * Sin rasgos ni objetos de corazón; las skill cards salen del Shuffle Time.
 */
export type ArcanaId =
  | 'fool' | 'magician' | 'priestess' | 'empress' | 'emperor' | 'hierophant'
  | 'lovers' | 'chariot' | 'justice' | 'hermit' | 'fortune' | 'strength'
  | 'hanged' | 'death' | 'temperance' | 'devil' | 'tower' | 'star' | 'moon'
  | 'sun' | 'judgement' | 'aeon' | 'jester' | 'world';

export type ResistElement = 'phy' | 'fir' | 'ice' | 'ele' | 'win' | 'lig' | 'dar' | 'alm';
export type SkillElement = ResistElement | 'ail' | 'rec' | 'sup' | 'pas';
export type Affinity = 'weak' | 'neutral' | 'resist' | 'null' | 'repel' | 'drain';

export interface PersonaSkill {
  skill: string;
  /** null = inicial */
  level: number | null;
  /** 'special' = se aprende de otra forma */
  note?: string;
}

export type UnlockCondition = { type: 'link'; arcana: ArcanaId } | { type: 'story'; detail: string };

export interface Persona {
  id: string;
  /** Número de la Persona dentro del juego (imagen pst_XXX) */
  gameId: number | null;
  /** Clave interna (nombre de la fuente de datos) */
  name: string;
  /** Nombres oficiales del juego */
  nameEn: string;
  nameEs: string | null;
  arcana: ArcanaId;
  level: number;
  flags: { special: boolean };
  specialRecipe: string[] | null;
  unlock: UnlockCondition | null;
  resistances: Record<ResistElement, Affinity>;
  stats: { st: number; ma: number; en: number; ag: number; lu: number };
  skills: PersonaSkill[];
  inheritance: string | null;
  /** Skill card que da en la Cafetería Chagall si la llevás equipada */
  cafeCard: string | null;
  /** Personas de compañeros: inicial, evolución (vínculo al máximo) y forma final (spoiler) */
  party?: { owner: string; stage: 'initial' | 'evolved' | 'ultimate'; baseId?: string; evolvedId?: string };
}

export interface SkillInfo {
  id: number;
  name: string;
  nameEn: string;
  nameEs: string | null;
  element: SkillElement;
  target: 'one' | 'all' | 'ally' | 'party' | 'self' | 'everyone' | null;
  ailment: string | null;
  cost: { type: 'sp' | 'hp'; value: number } | null;
  power: number | null;
  rank: number | null;
  unique: boolean;
  /** Existe como skill card */
  card: boolean;
  /** Persona que la da en la Cafetería Chagall */
  cafe: string | null;
}
