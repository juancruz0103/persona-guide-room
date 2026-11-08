import fusionJson from '../data/generated/fusion.json';
import { FusionEngine, type FusionData, type FusionOptions } from '../fusion/engine';
import { getAllPersonas } from './personas';

const DATA = fusionJson as unknown as FusionData;
const cache = new Map<string, FusionEngine>();

/** Devuelve un motor configurado con las opciones dadas (se reutiliza si ya existe). */
export function getFusionEngine(options: FusionOptions): FusionEngine {
  const key = `${options.includeDlc}-${options.includeTreasure}`;
  let engine = cache.get(key);
  if (!engine) {
    engine = new FusionEngine(getAllPersonas(), DATA, options);
    cache.set(key, engine);
  }
  return engine;
}

export const KIND_LABEL = {
  normal: 'Fusión normal',
  'same-arcana': 'Misma Arcana',
  treasure: 'Con Treasure Demon',
  'two-treasures': 'Dos Treasure Demons',
  special: 'Fusión especial',
} as const;
