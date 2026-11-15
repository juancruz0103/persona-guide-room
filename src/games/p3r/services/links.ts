import linksJson from '../data/generated/links.json';
import { LINKS, type LinkMeta } from '../data/links';
import { getAllPersonas } from './personas';
import type { ArcanaId, Persona } from '../types';

export interface LinkOption { es: string; en: string; pts: number; route: '' | 'R' | 'P' }
export interface LinkChoice { speaker: string; q: string; qEn: string; opts: LinkOption[] }
/** Un evento del vínculo. rank = rango al que lleva; route: R = romance, P = amistad. */
export interface LinkEvent { event: string; rank: number; route: '' | 'R' | 'P'; choices: LinkChoice[] }

const DIALOGS = linksJson as unknown as Record<string, { npc: string; events: LinkEvent[] }>;

export const getAllLinks = (): LinkMeta[] => LINKS;
export const getLink = (arcana: string): LinkMeta | undefined => LINKS.find((l) => l.arcana === arcana);
export const linkEvents = (arcana: ArcanaId): LinkEvent[] => DIALOGS[arcana]?.events ?? [];

/** Persona que se desbloquea para fusionar al llevar el vínculo al máximo. */
export const maxPersona = (arcana: ArcanaId): Persona | undefined =>
  getAllPersonas().find((p) => p.unlock?.type === 'link' && p.unlock.arcana === arcana);

/** Agrupa los eventos por rango (los intermedios, como 015, van con su rango). */
export function eventsByRank(arcana: ArcanaId): { rank: number; route: '' | 'R' | 'P'; events: LinkEvent[] }[] {
  const out: { rank: number; route: '' | 'R' | 'P'; events: LinkEvent[] }[] = [];
  for (const e of linkEvents(arcana)) {
    const g = out.find((x) => x.rank === e.rank && x.route === e.route);
    if (g) g.events.push(e);
    else out.push({ rank: e.rank, route: e.route, events: [e] });
  }
  // Si un rango tiene versión de amistad, la versión común es la de la ruta romántica.
  for (const g of out) if (!g.route && out.some((x) => x.rank === g.rank && x.route === 'P')) g.route = 'R';
  const order = { '': 0, R: 1, P: 2 } as const;
  return out.sort((a, b) => a.rank - b.rank || order[a.route] - order[b.route]);
}

export const progressId = (arcana: ArcanaId) => `p3r-${arcana}`;
