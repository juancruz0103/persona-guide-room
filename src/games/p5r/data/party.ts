import type { PartyOwner, PartyStage } from '../types';

/** Nombre corto de cada compañero (para "Persona de Ryuji"). */
export const PARTY_OWNER: Record<PartyOwner, string> = {
  ryuji: 'Ryuji',
  ann: 'Ann',
  morgana: 'Morgana',
  yusuke: 'Yusuke',
  makoto: 'Makoto',
  futaba: 'Futaba',
  haru: 'Haru',
  akechi: 'Akechi',
  kasumi: 'Kasumi',
};

export const PARTY_STAGE: Record<PartyStage, string> = {
  initial: 'Persona inicial',
  // Akechi: Loki llega por la historia, no por el confidente
  evolved: 'Evolucionada',
  third: 'Tercer semestre',
};

/** Las formas que no son la inicial son spoiler: su imagen va tapada. */
export const isSpoilerStage = (stage: PartyStage | undefined) => stage === 'evolved' || stage === 'third';
