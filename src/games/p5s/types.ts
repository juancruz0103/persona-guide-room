/**
 * Modelo de datos de Persona 5 Strikers.
 * Mismas 10 afinidades que P5R. Sin rasgos, sin skill cards de fusión ni confidentes.
 */
import type { Affinity, ResistElement, SkillElement } from '../p5r/types';
export type { Affinity, ResistElement, SkillElement };

export type ArcanaId =
  | 'fool' | 'magician' | 'priestess' | 'empress' | 'emperor' | 'hierophant'
  | 'lovers' | 'chariot' | 'justice' | 'hermit' | 'fortune' | 'strength'
  | 'hanged' | 'death' | 'temperance' | 'devil' | 'tower' | 'star' | 'moon'
  | 'sun' | 'judgement' | 'hope' | 'apostle';

export interface Persona {
  id: string;
  /** Clave interna (nombre de la fuente de datos) */
  name: string;
  nameEn: string;
  /** Nombre oficial en español (de Royal); null si la Persona no está en Royal */
  nameEs: string | null;
  arcana: ArcanaId;
  level: number;
  treasure: boolean;
  /** Dueño si es Persona de un compañero (joker, skull, mona…) */
  party: string | null;
  resistances: Record<ResistElement, Affinity>;
  stats: { st: number; ma: number; en: number; ag: number; lu: number };
  skills: { skill: string; level: number | null }[];
  inheritance: string | null;
  location: { es: string; en: string } | null;
  prereq: string | null;
  special: { name: string; level: number }[] | null;
  recipes: string[][];
  down: string[];
  /** Texto de origen oficial (compendio del juego) */
  mythEs: string | null;
  mythEn: string | null;
}

export interface SkillInfo {
  name: string;
  nameEn: string;
  nameEs: string | null;
  element: SkillElement;
  effect: string | null;
  descEs: string | null;
  descEn: string | null;
  cost: number | null;
  rank: number | null;
  /** Nombre armado con el patrón oficial de Royal (Resistir/Absorber/Anular + elemento) */
  derivedName: boolean;
}
