import type { ArcanaId, Confidant, ConfidantKind, Conversation, Persona } from '../types';
import indexJson from '../data/confidants/index.json';
import { getAllPersonas } from './personas';

export type ConfidantTag = 'thief' | 'romance' | 'royal' | 'deadline' | 'locked' | 'days' | 'mementos' | 'stat';

export interface ConfidantSummary {
  id: string;
  name: string;
  arcana: ArcanaId;
  kind: ConfidantKind;
  tags: ConfidantTag[];
  /** Persona inicial (solo Ladrones Fantasma) */
  persona?: string;
  /** Regla especial que conviene saber (fecha límite, rango bloqueado...) */
  notice?: string;
  phantomThief: boolean;
  romance: boolean;
  hasGuide: boolean;
}

export const TAG_LABEL: Record<ConfidantTag, string> = {
  thief: 'Ladrón Fantasma',
  romance: 'Romance',
  royal: 'Solo Royal',
  deadline: 'Fecha límite',
  locked: 'Rango bloqueado por la historia',
  days: 'Días fijos',
  mementos: 'Pedidos de Mementos',
  stat: 'Pide atributo',
};

export const KIND_LABEL: Record<ConfidantKind, string> = {
  normal: 'Normal',
  auto: 'Automático por la historia',
  fusion: 'Pedidos de fusión',
};

export function getConfidantSummary(id: string): ConfidantSummary | undefined {
  return CONFIDANTS.find((c) => c.id === id);
}

/** Persona que se desbloquea para fusionar al llegar al rango 10 de esa Arcana. */
export function ultimatePersona(arcana: ArcanaId): Persona | undefined {
  return getAllPersonas().find((p) => p.unlock?.type === 'confidant' && p.unlock.arcana === arcana && p.unlock.rank === 10);
}

export const CONFIDANTS = indexJson as unknown as ConfidantSummary[];

/** Cada confidente vive en su propio JSON y se carga solo cuando se abre. */
const files = import.meta.glob<{ default: Confidant }>('../data/confidants/*.json');

export async function loadConfidant(id: string): Promise<Confidant | null> {
  const loader = files[`../data/confidants/${id}.json`];
  if (!loader || id === 'index') return null;
  const mod = await loader();
  return mod.default;
}

/** Puntos máximos de una conversación y si todas las opciones empatan. */
export function analyzeConversation(c: Conversation): { max: number; allSame: boolean } {
  const pts = c.options.map((o) => o.points);
  const max = Math.max(...pts);
  return { max, allSame: pts.every((p) => p === max) };
}
