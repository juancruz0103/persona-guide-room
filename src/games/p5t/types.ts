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
