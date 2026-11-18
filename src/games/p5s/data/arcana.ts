import type { ArcanaId } from '../types';
import { ARCANAS as ROYAL } from '../../p5r/data/arcana';
import { L } from '../../../i18n';

export interface ArcanaInfo { id: ArcanaId; numeral: string; readonly name: string }

const ORDER: ArcanaId[] = [
  'fool', 'magician', 'priestess', 'empress', 'emperor', 'hierophant', 'lovers', 'chariot', 'justice', 'hermit', 'fortune',
  'strength', 'hanged', 'death', 'temperance', 'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'hope', 'apostle', 'treasure',
];
/** Arcanas nuevas de Strikers (las de Sophia y Wolf) y los demonios del tesoro. */
const EXTRA: Partial<Record<ArcanaId, { es: string; en: string }>> = {
  hope: { es: 'Esperanza', en: 'Hope' },
  apostle: { es: 'Apóstol', en: 'Apostle' },
  treasure: { es: 'Tesoro', en: 'Treasure' },
};

export const ARCANAS: ArcanaInfo[] = ORDER.map((id) => {
  const r = ROYAL.find((a) => a.id === (id as string));
  return {
    id,
    numeral: r?.numeral ?? '',
    get name() {
      return r ? r.name : L(EXTRA[id]!.es, EXTRA[id]!.en);
    },
  };
});
export const getArcana = (id: ArcanaId): ArcanaInfo => ARCANAS.find((a) => a.id === id)!;
