import type { ArcanaId, Confidant, FusionRequest, Persona } from '../../p5r/types';
import royalIndex from '../../p5r/data/confidants/index.json';
import type { ConfidantSummary } from '../../p5r/services/confidants';
import { getAllPersonas, getPersona } from './personas';
import { getFusionEngine } from './fusion';
import {
  AKECHI_TIMELINE, MORGANA_FIX, ROYAL_ONLY_CONFIDANTS, STRENGTH_REQUESTS, UNLOCK_FIXES, VANILLA_SOURCES,
} from '../data/vanillaConfidants';

export { TAG_LABEL, KIND_LABEL, analyzeConversation, type ConfidantTag, type ConfidantSummary } from '../../p5r/services/confidants';

/**
 * Confidentes de Persona 5 original: se arman a partir de los de Royal (textos oficiales)
 * aplicando las diferencias de data/vanillaConfidants.ts.
 */
export const CONFIDANTS: ConfidantSummary[] = (royalIndex as unknown as ConfidantSummary[])
  .filter((c) => !ROYAL_ONLY_CONFIDANTS.includes(c.id))
  .map((c) => {
    if (c.id !== 'akechi') return { ...c, tags: c.tags.filter((t) => t !== 'royal') };
    // En el original Akechi sube solo con la historia: no hay fecha límite ni atributos
    return { ...c, kind: 'auto', tags: ['thief'], notice: undefined };
  });

export const getConfidantSummary = (id: string) => CONFIDANTS.find((c) => c.id === id);

/** Persona que se desbloquea para fusionar al llegar al rango 10 de esa Arcana (datos de P5). */
export function ultimatePersona(arcana: ArcanaId): Persona | undefined {
  return getAllPersonas().find((p) => p.unlock?.type === 'confidant' && p.unlock.arcana === arcana && p.unlock.rank === 10);
}

const files = import.meta.glob<{ default: Confidant }>('../../p5r/data/confidants/*.json');

/** Progreso guardado aparte del de Royal. */
export const progressId = (id: string) => `p5:${id}`;

export async function loadConfidant(id: string): Promise<Confidant | null> {
  if (id === 'index' || ROYAL_ONLY_CONFIDANTS.includes(id)) return null;
  const loader = files[`../../p5r/data/confidants/${id}.json`];
  if (!loader) return null;
  const royal = structuredClone((await loader()).default);
  return toVanilla(royal);
}

/** Aplica las diferencias del original sobre un confidente de Royal. */
export function toVanilla(c: Confidant): Confidant {
  c.sources = [...c.sources, ...VANILLA_SOURCES];
  // Sin llamadas (son de Royal)
  for (const r of c.ranks) r.conversations = r.conversations.filter((x) => !('kind' in x) || x.kind !== 'phone');

  if (c.id === 'akechi') {
    c.kind = 'auto';
    c.timeline = AKECHI_TIMELINE;
    c.ranks = [];
    c.tips = [];
    return c;
  }
  if (c.id === 'morgana' && c.timeline) {
    c.timeline = c.timeline.map((t) =>
      t.rank === 2 ? { ...t, ability: MORGANA_FIX.rank2.name, description: MORGANA_FIX.rank2.description }
        : t.rank === 10 ? { ...t, description: (t.description ?? '').replace(MORGANA_FIX.stripRank10, '') } : t,
    );
  }
  if (c.id === 'caroline-justine') c.requests = STRENGTH_REQUESTS.map((r) => ({ ...r, quick: quickRecipes(r.persona) })) as FusionRequest[];

  const fix = UNLOCK_FIXES[c.id];
  if (fix) {
    const moved: { rank: number; unlock: { name: string; description: string } }[] = [];
    for (const r of c.ranks) {
      r.unlocks = r.unlocks.filter((u) => {
        if (fix.remove?.includes(u.name)) return false;
        if (fix.strip?.[u.name]) u.description = u.description.replace(fix.strip[u.name], '');
        if (fix.move?.[u.name] && fix.move[u.name] !== r.rank) {
          moved.push({ rank: fix.move[u.name], unlock: u });
          return false;
        }
        return true;
      });
    }
    const extra = [...moved, ...(fix.add ?? []).map(({ rank, provisional, ...u }) => ({
      rank,
      unlock: provisional ? { ...u, description: `${u.description} (Nombre provisorio: no está en Royal.)` } : u,
    }))];
    for (const { rank, unlock } of extra) {
      const r = c.ranks.find((x) => x.rank === rank);
      if (r) {
        r.unlocks = [...r.unlocks, unlock];
        r.noReward = false;
      }
    }
  }
  return c;
}

/** Armado rápido con los datos de P5: la fusión especial o las 2 recetas de menor nivel. */
function quickRecipes(id: string): string[][] {
  const p = getPersona(id);
  if (!p) return [];
  const engine = getFusionEngine({ includeDlc: false, includeTreasure: false });
  const special = engine.specialRecipe(p);
  if (special) return [special.map((s) => s.id)];
  return [...engine.recipesFor(p)]
    .sort((x, y) => Math.max(x.a.level, x.b.level) - Math.max(y.a.level, y.b.level))
    .slice(0, 2)
    .map((r) => [r.a.id, r.b.id]);
}
