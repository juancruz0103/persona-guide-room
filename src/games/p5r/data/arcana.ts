import type { ArcanaId } from '../types';

export interface ArcanaInfo {
  id: ArcanaId;
  name: string;
  /** Número romano del tarot. Faith y Councillor son de Royal y no tienen número. */
  numeral: string;
}

/** Orden oficial de Arcanas de P5R (mismo orden que la tabla de fusión). */
export const ARCANAS: ArcanaInfo[] = [
  { id: 'fool', name: 'Fool', numeral: '0' },
  { id: 'magician', name: 'Magician', numeral: 'I' },
  { id: 'priestess', name: 'Priestess', numeral: 'II' },
  { id: 'empress', name: 'Empress', numeral: 'III' },
  { id: 'emperor', name: 'Emperor', numeral: 'IV' },
  { id: 'hierophant', name: 'Hierophant', numeral: 'V' },
  { id: 'lovers', name: 'Lovers', numeral: 'VI' },
  { id: 'chariot', name: 'Chariot', numeral: 'VII' },
  { id: 'justice', name: 'Justice', numeral: 'VIII' },
  { id: 'hermit', name: 'Hermit', numeral: 'IX' },
  { id: 'fortune', name: 'Fortune', numeral: 'X' },
  { id: 'strength', name: 'Strength', numeral: 'XI' },
  { id: 'hanged', name: 'Hanged', numeral: 'XII' },
  { id: 'death', name: 'Death', numeral: 'XIII' },
  { id: 'temperance', name: 'Temperance', numeral: 'XIV' },
  { id: 'devil', name: 'Devil', numeral: 'XV' },
  { id: 'tower', name: 'Tower', numeral: 'XVI' },
  { id: 'star', name: 'Star', numeral: 'XVII' },
  { id: 'moon', name: 'Moon', numeral: 'XVIII' },
  { id: 'sun', name: 'Sun', numeral: 'XIX' },
  { id: 'judgement', name: 'Judgement', numeral: 'XX' },
  { id: 'faith', name: 'Faith', numeral: 'F' },
  { id: 'councillor', name: 'Councillor', numeral: 'C' },
  { id: 'world', name: 'World', numeral: 'XXI' },
];

const BY_ID = new Map(ARCANAS.map((a) => [a.id, a]));

export function getArcana(id: ArcanaId): ArcanaInfo {
  const a = BY_ID.get(id);
  if (!a) throw new Error(`Arcana desconocida: ${id}`);
  return a;
}
