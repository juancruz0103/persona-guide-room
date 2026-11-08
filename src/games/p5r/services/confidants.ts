import type { ArcanaId, Confidant, Conversation } from '../types';
import indexJson from '../data/confidants/index.json';

export interface ConfidantSummary {
  id: string;
  name: string;
  arcana: ArcanaId;
  phantomThief: boolean;
  romance: boolean;
  hasGuide: boolean;
}

export const CONFIDANTS = indexJson as ConfidantSummary[];

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
