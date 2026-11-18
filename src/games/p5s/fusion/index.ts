import { getAllPersonas } from '../services/personas';
import { FusionEngine } from './engine';

let engine: FusionEngine | null = null;
export const getFusionEngine = (): FusionEngine => (engine ??= new FusionEngine(getAllPersonas()));
