import personasJson from '../data/generated/personas.json';
import fusionJson from '../data/generated/fusion.json';
import type { Persona } from '../types';
import { FusionEngine, type FusionData, type FusionOptions } from './engine';

export const P3R_PERSONAS = personasJson as unknown as Persona[];
const DATA = fusionJson as unknown as FusionData;
const cache = new Map<string, FusionEngine>();

export function getFusionEngine(options: FusionOptions = { includeDlc: true }): FusionEngine {
  const key = String(options.includeDlc);
  let e = cache.get(key);
  if (!e) cache.set(key, (e = new FusionEngine(P3R_PERSONAS, DATA, options)));
  return e;
}
