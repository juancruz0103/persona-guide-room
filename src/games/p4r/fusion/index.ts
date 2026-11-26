import personasJson from '../data/generated/personas.json';
import fusionJson from '../data/generated/fusion.json';
import type { Persona } from '../types';
import { FusionEngine, type FusionData } from './engine';

export const P4R_PERSONAS = personasJson as unknown as Persona[];
const DATA = fusionJson as unknown as FusionData;
let engine: FusionEngine | null = null;

export function getFusionEngine(): FusionEngine {
  return (engine ??= new FusionEngine(P4R_PERSONAS, DATA, {}));
}
