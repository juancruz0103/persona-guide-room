import namesJson from './generated/names-es.json';
import type { ArcanaId } from '../types';
import { L } from '../../../i18n';

const NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', ''];
const ORDER: [ArcanaId, string][] = [
  ['fool', 'Fool'], ['magician', 'Magician'], ['priestess', 'High Priestess'], ['empress', 'Empress'], ['emperor', 'Emperor'],
  ['hierophant', 'Hierophant'], ['lovers', 'Lovers'], ['chariot', 'Chariot'], ['justice', 'Justice'], ['hermit', 'Hermit'],
  ['fortune', 'Fortune'], ['strength', 'Strength'], ['hanged', 'Hanged Man'], ['death', 'Death'], ['temperance', 'Temperance'],
  ['devil', 'Devil'], ['tower', 'Tower'], ['star', 'Star'], ['moon', 'Moon'], ['sun', 'Sun'], ['judgement', 'Judgement'], ['aeon', 'Aeon'],
];
const RAW = (namesJson as { arcana: Record<string, { es: string; link: string; linkEn: string }> }).arcana;
/** "del Loco" → "Loco": el juego guarda el nombre con artículo para usarlo en frases. */
const clean = (s: string) => s.replace(/^(del|de la|de los|de las) /, '');

export interface ArcanaInfo {
  id: ArcanaId;
  numeral: string;
  readonly name: string;
  /** Nombre del vínculo social de esa Arcana (oficial) */
  readonly link: string;
}

export const ARCANAS: ArcanaInfo[] = ORDER.map(([id, en], i) => ({
  id,
  numeral: NUMERALS[i],
  get name() {
    return L(clean(RAW[en]?.es ?? en), en);
  },
  get link() {
    return L(RAW[en]?.link ?? '', RAW[en]?.linkEn ?? '');
  },
}));

export const getArcana = (id: ArcanaId): ArcanaInfo => ARCANAS.find((a) => a.id === id)!;
