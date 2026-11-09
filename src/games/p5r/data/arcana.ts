import type { ArcanaId } from '../types';

export interface ArcanaInfo {
  id: ArcanaId;
  /** Nombre oficial de la versión en español */
  name: string;
  /** Nombre oficial de la versión en inglés */
  nameEn: string;
  /** Número romano del tarot. Faith y Councillor son de Royal y no tienen número. */
  numeral: string;
}

/** Orden oficial de Arcanas de P5R (mismo orden que la tabla de fusión). */
export const ARCANAS: ArcanaInfo[] = [
  { id: 'fool', name: 'Loco', nameEn: 'Fool', numeral: '0' },
  { id: 'magician', name: 'Mago', nameEn: 'Magician', numeral: 'I' },
  { id: 'priestess', name: 'Sacerdotisa', nameEn: 'High Priestess', numeral: 'II' },
  { id: 'empress', name: 'Emperatriz', nameEn: 'Empress', numeral: 'III' },
  { id: 'emperor', name: 'Emperador', nameEn: 'Emperor', numeral: 'IV' },
  { id: 'hierophant', name: 'Hierofante', nameEn: 'Hierophant', numeral: 'V' },
  { id: 'lovers', name: 'Amantes', nameEn: 'Lovers', numeral: 'VI' },
  { id: 'chariot', name: 'Carro', nameEn: 'Chariot', numeral: 'VII' },
  { id: 'justice', name: 'Justicia', nameEn: 'Justice', numeral: 'VIII' },
  { id: 'hermit', name: 'Ermitaño', nameEn: 'Hermit', numeral: 'IX' },
  { id: 'fortune', name: 'Fortuna', nameEn: 'Fortune', numeral: 'X' },
  { id: 'strength', name: 'Fuerza', nameEn: 'Strength', numeral: 'XI' },
  { id: 'hanged', name: 'Ahorcado', nameEn: 'Hanged Man', numeral: 'XII' },
  { id: 'death', name: 'Muerte', nameEn: 'Death', numeral: 'XIII' },
  { id: 'temperance', name: 'Templanza', nameEn: 'Temperance', numeral: 'XIV' },
  { id: 'devil', name: 'Diablo', nameEn: 'Devil', numeral: 'XV' },
  { id: 'tower', name: 'Torre', nameEn: 'Tower', numeral: 'XVI' },
  { id: 'star', name: 'Estrella', nameEn: 'Star', numeral: 'XVII' },
  { id: 'moon', name: 'Luna', nameEn: 'Moon', numeral: 'XVIII' },
  { id: 'sun', name: 'Sol', nameEn: 'Sun', numeral: 'XIX' },
  { id: 'judgement', name: 'Juicio', nameEn: 'Judgement', numeral: 'XX' },
  { id: 'faith', name: 'Fe', nameEn: 'Faith', numeral: 'F' },
  { id: 'councillor', name: 'Consejero', nameEn: 'Councillor', numeral: 'C' },
  { id: 'world', name: 'Mundo', nameEn: 'World', numeral: 'XXI' },
];

const BY_ID = new Map(ARCANAS.map((a) => [a.id, a]));

export function getArcana(id: ArcanaId): ArcanaInfo {
  const a = BY_ID.get(id);
  if (!a) throw new Error(`Arcana desconocida: ${id}`);
  return a;
}
