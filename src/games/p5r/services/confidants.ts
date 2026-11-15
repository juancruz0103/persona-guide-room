import type { ArcanaId, Confidant, ConfidantKind, Conversation, Persona } from '../types';
import indexJson from '../data/confidants/index.json';
import { bilingual } from '../../../i18n';
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

export const TAG_LABEL: Record<ConfidantTag, string> = bilingual({
  thief: 'Ladrón Fantasma',
  romance: 'Romance',
  royal: 'Solo Royal',
  deadline: 'Fecha límite',
  locked: 'Rango bloqueado por la historia',
  days: 'Días fijos',
  mementos: 'Misiones de Mementos',
  stat: 'Pide atributo',
} as Record<ConfidantTag, string>, { thief: 'Phantom Thief', romance: 'Romance', royal: 'Royal only', deadline: 'Deadline', locked: 'Rank locked by the story', days: 'Fixed days', mementos: 'Mementos requests', stat: 'Needs a social stat' });

export const KIND_LABEL: Record<ConfidantKind, string> = bilingual({
  normal: 'Normal',
  auto: 'Automático por la historia',
  fusion: 'Pedidos de fusión',
} as Record<ConfidantKind, string>, { normal: 'Normal', auto: 'Automatic with the story', fusion: 'Fusion requests' });

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
export function analyzeConversation(c: Conversation): { max: number; allSame: boolean; hasRecommended: boolean } {
  const pts = c.options.map((o) => o.points);
  const max = Math.max(...pts);
  const hasRecommended = c.options.some((o) => o.recommended);
  return { max, allSame: !hasRecommended && pts.every((p) => p === max), hasRecommended };
}
