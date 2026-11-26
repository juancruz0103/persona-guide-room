import linksJson from '../data/generated/links.json';
import { LINKS, type LinkMeta } from '../data/links';
import { getAllPersonas } from './personas';
import type { ArcanaId, Persona } from '../types';

/** Ruta: L = romance, F = amistad. */
export type Route = '' | 'L' | 'F';
/** route L: esta respuesta elige el romance. */
export interface LinkOption { es: string; en: string; pts: number; route?: 'L' }
export interface LinkChoice { speaker: string; speakerEn: string; q: string; qEn: string; opts: LinkOption[] }
/** Un evento del vínculo. rank = rango al que lleva. */
export interface LinkEvent { event: string; rank: number; route: Route; choices: LinkChoice[] }

const DIALOGS = linksJson as unknown as Record<string, LinkEvent[]>;

export const getAllLinks = (): LinkMeta[] => LINKS;
export const getLink = (id: string): LinkMeta | undefined => LINKS.find((l) => l.id === id);
export const linkEvents = (id: string): LinkEvent[] => DIALOGS[id] ?? [];

/** Persona que se desbloquea para fusionar al llevar el vínculo al máximo. */
export const maxPersona = (arcana: ArcanaId): Persona | undefined =>
  getAllPersonas().find((p) => p.unlock?.type === 'link' && p.unlock.arcana === arcana);

/** Agrupa los eventos por rango y ruta. */
export function eventsByRank(id: string): { rank: number; route: Route; events: LinkEvent[] }[] {
  const out: { rank: number; route: Route; events: LinkEvent[] }[] = [];
  for (const e of linkEvents(id)) {
    const g = out.find((x) => x.rank === e.rank && x.route === e.route);
    if (g) g.events.push(e);
    else out.push({ rank: e.rank, route: e.route, events: [e] });
  }
  const order = { '': 0, L: 1, F: 2 } as const;
  return out.sort((a, b) => a.rank - b.rank || order[a.route] - order[b.route]);
}

export const progressId = (id: string) => `p4r-${id}`;
