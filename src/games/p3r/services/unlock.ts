import type { UnlockCondition } from '../types';
import { getArcana } from '../data/arcana';
import { L } from '../../../i18n';

const TEAMMATE: Record<string, string> = {
  junpei: 'Junpei', akihiko: 'Akihiko', koromaru: 'Koromaru', ken: 'Ken', shinjiro: 'Shinjiro', ryoji: 'Ryoji',
};

/** Condición para poder fusionar la Persona, en texto. */
export function unlockText(u: UnlockCondition): string {
  switch (u.type) {
    case 'link': return L(`Vínculo ${getArcana(u.arcana).name} al rango 10`, `${getArcana(u.arcana).name} Social Link at rank 10`);
    case 'allLinks': return L('Todos los vínculos sociales al máximo', 'All Social Links maxed');
    case 'teammate': return L(`Episodios con ${TEAMMATE[u.who] ?? u.who} completos`, `${TEAMMATE[u.who] ?? u.who}'s episodes completed`);
    case 'dlc': return L(`DLC: ${u.pack}`, `DLC: ${u.pack}`);
    case 'request': return L(`Completar la petición n.º ${u.number} de Elizabeth`, `Complete Elizabeth's request #${u.number}`);
    case 'tartarus': return L(`Tártaro: bloque ${u.block}, piso ${u.floor}`, `Tartarus: ${u.block} block, floor ${u.floor}`);
    default: return u.detail;
  }
}
