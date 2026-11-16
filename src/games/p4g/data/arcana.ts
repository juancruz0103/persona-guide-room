import fusionJson from './generated/fusion.json';
import type { ArcanaId } from '../types';
import { L } from '../../../i18n';

const NAMES = (fusionJson as { arcanaNames: Record<string, { en: string; es: string }> }).arcanaNames;
const NUMERALS: Partial<Record<ArcanaId, string>> = {
  fool: '0', magician: 'I', priestess: 'II', empress: 'III', emperor: 'IV', hierophant: 'V', lovers: 'VI', chariot: 'VII',
  justice: 'VIII', hermit: 'IX', fortune: 'X', strength: 'XI', hanged: 'XII', death: 'XIII', temperance: 'XIV', devil: 'XV',
  tower: 'XVI', star: 'XVII', moon: 'XVIII', sun: 'XIX', judgement: 'XX', world: 'XXI',
};
const ORDER: ArcanaId[] = [
  'fool', 'magician', 'priestess', 'empress', 'emperor', 'hierophant', 'lovers', 'chariot', 'justice', 'hermit', 'fortune',
  'strength', 'hanged', 'death', 'temperance', 'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'aeon', 'jester', 'world',
];

export interface ArcanaInfo {
  id: ArcanaId;
  numeral: string;
  readonly name: string;
}

/** Arcanas con sus nombres oficiales del juego (español e inglés). */
export const ARCANAS: ArcanaInfo[] = ORDER.map((id) => ({
  id,
  numeral: NUMERALS[id] ?? '',
  get name() {
    return L(NAMES[id]?.es ?? id, NAMES[id]?.en ?? id);
  },
}));

export const getArcana = (id: ArcanaId): ArcanaInfo => ARCANAS.find((a) => a.id === id)!;
