import { CHART, getAllPersonas } from '../services/personas';
import { FusionEngine } from './engine';

const engines = new Map<boolean, FusionEngine>();
/** `dlc`: contar las Personas de DLC (Pícaros y Raoul). */
export const getFusionEngine = (dlc = true): FusionEngine => {
  if (!engines.has(dlc)) engines.set(dlc, new FusionEngine(getAllPersonas(), CHART, { dlc }));
  return engines.get(dlc)!;
};
