/**
 * Modelo de datos de Persona 5 Tactica (sacado de los archivos del juego, ver scripts/p5t-data).
 * No hay Arcanas: cada Persona tiene un tipo de estado alterado, que es lo que manda en la fusión.
 */
export type PersonaType =
  | 'burn' | 'freeze' | 'sweep' | 'despair' | 'shock'
  | 'vortex' | 'brainwash' | 'dizzy' | 'forget' | 'sleep';

/** quest: se habilita con una misión · legacy: Persona de otros juegos · bonus/dlc: contenido descargable */
export type Unlock = 'quest' | 'legacy' | 'bonus' | 'dlc' | null;

export interface PersonaSkill {
  nameEs: string | null;
  nameEn: string | null;
  descEs: string | null;
  descEn: string | null;
  rank: number;
  inheritable: boolean;
}

export interface Persona {
  id: string;
  nameEs: string;
  nameEn: string;
  type: PersonaType;
  level: number;
  stats: { hp: number; sp: number; melee: number; gun: number };
  /** Lo que suma cada stat por nivel */
  growth: { hp: number; sp: number; melee: number; gun: number };
  /** Habilidad única de la Persona */
  unique: PersonaSkill | null;
  /** Habilidad heredada que trae al conseguirla sin fusionar */
  inherited: PersonaSkill | null;
  /** false: solo sale por fusión especial */
  normalFusion: boolean;
  unlock: Unlock;
  /** Ids de los ingredientes de la fusión especial */
  special: string[] | null;
  /** La fusión especial hay que habilitarla antes en el juego */
  specialLocked: boolean;
  mythEs: string | null;
  mythEn: string | null;
}

export interface Text { es: string | null; en: string | null }

export interface TreeNode {
  id: string;
  /** 0: rama de la Persona · 1: rama del personaje · 2: «Resolución rebelde» */
  tree: number;
  parents: string[];
  /** PC necesarios */
  cost: number;
  x: number;
  y: number;
  name: Text;
  desc: Text;
  /** learn: habilidad nueva de la Persona · upgrade: mejora de la anterior · passive: pasiva */
  kind: 'learn' | 'upgrade' | 'passive';
  /** Habilidad más fuerte de la rama */
  strongest: boolean;
  /** Se habilita con una misión */
  quest: boolean;
  skill?: number;
}

export interface MemberSkill {
  id: number;
  node: string;
  name: Text;
  desc: Text;
  cost: number | null;
  costType: 'hp' | 'sp';
  damage: [number, number] | null;
  range: number | null;
  ailment: PersonaType | null;
}

export interface WeaponVariant {
  damage: [number, number];
  range: number | null;
  ailment: PersonaType | null;
  ailmentRate: number | null;
}

export interface Weapon {
  id: string;
  name: Text;
  desc: Text;
  /** El juego tiene hasta 4 versiones de cada arma fabricada, con distintos valores */
  variants: WeaponVariant[];
  /** Fusión de armas en el Velvet Room: tipo y nivel mínimo de cada Persona */
  recipe: { type: PersonaType; level: number }[] | null;
}

export interface Member {
  id: string;
  codename: Text;
  name: Text;
  persona: Text | null;
  stats: { hp: number; sp: number; move: number };
  trees: Text[];
  nodes: TreeNode[];
  personaSkills: MemberSkill[];
  weapons: Weapon[];
}
