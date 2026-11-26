import type { UnlockCondition } from '../types';
import { getArcana } from '../data/arcana';
import { L } from '../../../i18n';

/** Condición para poder fusionar la Persona, en texto. */
export function unlockText(u: UnlockCondition): string {
  switch (u.type) {
    case 'link': return L(`Vínculo ${getArcana(u.arcana).name} al rango 10`, `${getArcana(u.arcana).name} Social Link at rank 10`);
    default: return u.detail === 'Clear True Ending' ? L('Terminar el final verdadero', 'Clear the true ending') : u.detail;
  }
}
