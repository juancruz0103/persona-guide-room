/**
 * Modelo de datos de Persona 5 Royal.
 * Esquema definido en docs/ETAPA-1-informe.md (sección 3.3).
 */

export type ArcanaId =
  | 'fool' | 'magician' | 'priestess' | 'empress' | 'emperor' | 'hierophant'
  | 'lovers' | 'chariot' | 'justice' | 'hermit' | 'fortune' | 'strength'
  | 'hanged' | 'death' | 'temperance' | 'devil' | 'tower' | 'star' | 'moon'
  | 'sun' | 'judgement' | 'faith' | 'councillor' | 'world';

/** Los 10 elementos que tienen afinidad (resistencias/debilidades). */
export type ResistElement =
  | 'phy' | 'gun' | 'fir' | 'ice' | 'ele' | 'win' | 'psy' | 'nuk' | 'ble' | 'cur';

/** Todos los tipos de skill: los 10 de arriba + los que no tienen afinidad. */
export type SkillElement = ResistElement | 'alm' | 'ail' | 'rec' | 'sup' | 'pas';

export type Affinity = 'weak' | 'neutral' | 'resist' | 'null' | 'repel' | 'drain';

export interface PersonaSkill {
  skill: string;
  /** null = skill inicial */
  level: number | null;
  /** Personas de compañeros: cómo se aprende ("Rango 4", "Al evolucionar", "Tercer semestre") */
  note?: string;
}

export type UnlockCondition =
  | { type: 'confidant'; arcana: ArcanaId; rank: number }
  | { type: 'story'; detail: string }
  | { type: 'dlc'; pack: string }
  | { type: 'treasure'; detail: string };

export interface Persona {
  id: string;
  name: string;
  arcana: ArcanaId;
  level: number;
  flags: { dlc: boolean; treasure: boolean; special: boolean; picaro: boolean };
  /** Ingredientes fijos si es una fusión especial */
  specialRecipe: string[] | null;
  unlock: UnlockCondition | null;
  resistances: Record<ResistElement, Affinity>;
  /** null = todavía no cargado (se completa en la Etapa 3) */
  stats: { st: number; ma: number; en: number; ag: number; lu: number } | null;
  skills: PersonaSkill[] | null;
  inheritance: SkillElement | null;
  trait: string | null;
  itemization: string | null;
  /** Item de la silla eléctrica con la Alarma de fusión activa ("itemr" en la fuente). */
  itemizationAlt?: string | null;
  image: string | null;
  /** Solo en las Personas de los compañeros: no se fusionan */
  party?: PartyInfo;
}

export type PartyOwner = 'ryuji' | 'ann' | 'morgana' | 'yusuke' | 'makoto' | 'futaba' | 'haru' | 'akechi' | 'kasumi';
/** initial = la que despierta; evolved = rango 10 de confidente; third = tercer semestre */
export type PartyStage = 'initial' | 'evolved' | 'third';

export interface PartyInfo {
  owner: PartyOwner;
  stage: PartyStage;
  /** id de la Persona inicial del mismo compañero */
  baseId: string;
}

export interface SkillInfo {
  name: string;
  /** 'tra' = rasgo (trait) */
  element: SkillElement | 'tra';
  target: 'one' | 'all' | 'ally' | 'party' | 'self' | 'everyone' | null;
  /** Estado alterado que puede causar (clave de AILMENTS) */
  ailment: AilmentId | null;
  cost?: { type: 'sp' | 'hp'; value: number } | null;
  power?: number | null;
  /** true = exclusiva: no existe como skill card */
  unique?: boolean;
}

/* ---------- Silla eléctrica ---------- */

export type ItemType = 'melee' | 'gun' | 'armor' | 'accessory' | 'skillcard' | 'unknown';
export type ItemOwner = 'joker' | 'skull' | 'mona' | 'panther' | 'fox' | 'queen' | 'noir' | 'crow' | 'violet';

export interface ItemInfo {
  name: string;
  type: ItemType;
  /** Arma: de qué personaje es */
  owner?: ItemOwner | null;
  /** Armadura: para quién es */
  gender?: 'male' | 'female' | 'unisex' | 'morgana' | null;
  /** Accesorio o skill card: la skill que da */
  skill?: string;
  stats?: { attack?: number; accuracy?: number; defense?: number; evasion?: number; rounds?: number };
  effects?: string[];
  /** Estadísticas tomadas de P5 original */
  p5Stats?: boolean;
  /** Versión de Royal (R, EX, II) de este item base */
  variantOf?: string | null;
  source: string | null;
}

export type AilmentId =
  | 'burn' | 'freeze' | 'shock' | 'dizzy' | 'sleep' | 'forget'
  | 'confuse' | 'fear' | 'despair' | 'rage' | 'brainwash' | 'hunger';

export interface TechnicalRule {
  ailment: AilmentId;
  /** 'any' = cualquier elemento */
  base: (ResistElement | 'any')[];
  /** Combinaciones extra al leer «Entender el corazón» (Knowing the Heart, solo Royal) */
  knowingTheHeart: ResistElement[];
}

/* ---------- Confidentes ---------- */

export interface DialogueOption {
  /** Texto en español (España). `provisional: true` si no es el texto oficial. */
  es: string;
  en: string;
  points: number;
  /** Respuesta que abre (o elige) la ruta romántica */
  romance?: boolean;
  /** Recomendada por la guía, pero sin puntos conocidos */
  recommended?: boolean;
}

/** Aviso entre conversaciones: el confidente te da una misión de Mementos */
export interface MementosMission {
  kind: 'mementos';
  /** Título de la guía (en inglés: el título oficial no está en los archivos extraídos) */
  title: string;
  /** Descripción oficial del juego */
  description: string;
}

export type RankItem = Conversation | MementosMission;

export interface Conversation {
  kind: 'conversation' | 'phone';
  royalOnly: boolean;
  /** true = traducción propia (las llamadas de Royal no están en los eventos del juego) */
  provisional?: boolean;
  romance: boolean;
  /** Solo aparece en una ruta del rango con romance: 'romance' (la aceptaste) o 'friend' (la rechazaste) */
  route?: 'romance' | 'friend';
  speaker: string;
  prompt: { es: string; en: string };
  options: DialogueOption[];
}

export interface ConfidantRank {
  rank: number;
  /** true cuando las respuestas no cambian los puntos */
  choicesDontMatter?: boolean;
  /** true cuando el juego tiene elecciones pero la guía no da sus puntos */
  noData?: boolean;
  /** Requisitos para llegar a este rango (atributos, fechas, misiones) */
  requirements?: string[];
  /** true cuando el rango no da ninguna recompensa */
  noReward?: boolean;
  conversations: RankItem[];
  unlocks: { name: string; description: string }[];
}

/** normal = conversaciones con puntos; auto = sube solo con la historia; fusion = pedidos de fusión */
export type ConfidantKind = 'normal' | 'auto' | 'fusion';

export interface TimelineRank {
  rank: number;
  when: string;
  ability?: string;
  description?: string;
  /** Otras habilidades del mismo rango */
  extra?: { ability: string; description: string }[];
}

export interface FusionRequest {
  rank: number;
  /** id de la Persona pedida */
  persona: string;
  /** skill que tiene que tener (clave interna) */
  skill: string;
  /** armados rápidos: listas de ids de Personas a fusionar */
  quick: string[][];
  note?: string;
  reward?: { name: string; description: string };
}

export interface Confidant {
  kind?: ConfidantKind;
  timeline?: TimelineRank[];
  requests?: FusionRequest[];
  spoiler?: { title: string; items: string[]; note?: string };
  id: string;
  name: string;
  arcana: ArcanaId;
  phantomThief: boolean;
  romance: boolean;
  maxRank: number;
  tips: string[];
  /** Rangos cargados. Los que faltan se muestran como "pendiente". */
  ranks: ConfidantRank[];
  textsProvisional: boolean;
  sources: string[];
}
