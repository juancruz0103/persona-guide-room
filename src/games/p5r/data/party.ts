import type { PartyOwner, PartyStage } from '../types';
import { bilingual } from '../../../i18n';

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

export const PARTY_STAGE: Record<PartyStage, string> = bilingual({
  initial: 'Persona inicial',
  // Akechi: Loki llega por la historia, no por el confidente
  evolved: 'Evolucionada',
  third: 'Tercer semestre',
} as Record<PartyStage, string>, { initial: 'Initial Persona', evolved: 'Evolved', third: 'Third semester' });

/** Las formas que no son la inicial son spoiler: su imagen va tapada. */
export const isSpoilerStage = (stage: PartyStage | undefined) => stage === 'evolved' || stage === 'third';
