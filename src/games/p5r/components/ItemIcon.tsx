import type { ItemInfo, ItemOwner } from '../types';

/**
 * Íconos de items de la silla eléctrica — diseño propio (no son los oficiales):
 * silueta roja sobre fondo negro, aprobados en el tablero "SkillCards".
 */
const MELEE: Record<ItemOwner, string> = {
  joker: 'M2 21l8-8 2 2-8 8z M10.5 12.5L20 3c1.5 3 .5 6.5-2.5 9.5L13 15z',
  skull: 'M3 20l11-11 2 2L5 22z M13 9l2-5 3-1 2 2-1 3-5 2z',
  mona: 'M2.5 21.5l2-2 1.2 1.2-2 2z M5 19l1 1C12 17 18 11 21 3c-4 5-9 10.5-16 16z',
  panther: 'M2 20c3 0 4-4 7-4s3 3 6 2 4-6 5-9l1.6.6c-1 4-3 9-6.4 10S11 17.6 9 17.6 5 21.6 2 21.6z M19 7l3-4 1 1-3 4z',
  fox: 'M2 21l1.6-1.6 1.2 1.2L3.2 22.2z M4.3 18.8l1.2 1.2L21.5 4.2 21 2.5l-1.6.5z M4.5 16.2l3.6 3.6-1 .8L3.6 17z',
  queen: 'M4 10h16v6H4z M4.5 7h3.2v2.4H4.5z M8.6 6.5h3.2v2.9H8.6z M12.7 6.5h3.2v2.9h-3.2z M16.8 7H20v2.4h-3.2z M9 16h6l-1 4h-4z',
  noir: 'M5 21.5l-1.4-1.4 10-10 1.4 1.4z M12.5 3.5c4.5-.3 8.3 3.4 8 8l-3.5.8-5.3-5.3z',
  crow: 'M3 21l2-2 1.2 1.2-2 2z M5.7 18.3l-1-1 3-2.3 1 1z M8 16.5l12-12.7 1.3 1.2L9.2 17.7z',
  violet: 'M3 21.5l1.5-1.5 1 1L4 22.5z M5.2 19.8l1 1L21.3 4.6l-.8-.8z M3.6 16.4a3.4 3.4 0 0 0 4 4l.5-1.1a2.2 2.2 0 0 1-3.4-2.4z',
};

const GUN: Record<ItemOwner, string> = {
  joker: 'M3 7.5h15.5V11H16v1H9.5l-1 7.5H5l1-7.5H3z',
  skull: 'M1.5 9h19v2.2H11.5l-1 2-4.5 4.5H2.5L6 13.4v-2.2H1.5z',
  mona: 'M10.8 22v-8L5.5 3.5h2.4l4.1 8.3 4.1-8.3h2.4L13.2 14v8z',
  panther: 'M2.5 8h18v3.2h-3v2.3h-3v-2.3H12v8.3H8.6v-8.3H6v3H2.5z',
  fox: 'M1.5 9.5h15l4-2h2v3.3l-3 1v2.4h-4.2l-2 2H6l-1-3.2H1.5z',
  queen: 'M3 7.5h14.5v3.3H10.5l-.5 1.4-2.3 7.3H4.3l2.4-8.7H3z M10.5 13a2.2 2.2 0 0 0 4.4 0z',
  noir: 'M1.5 7.5h16.5v6.5H11l-2 5.5H5.8l1.2-5.5H1.5z M18 8.5h4.5v4.5H18z',
  crow: 'M3 9h10.5l4-3.2h3.5v8.4h-3.5l-4-3.2H9.4L8.2 17H5l1.2-6H3z',
  violet: 'M1.5 10h16.3l3.4-1.2v2.4l-3.4 1.2h-6l-2 2.6c1.3 2 .2 4.2-2 4.4l-.7-1.1c1 0 1.8-1 1.1-2.1L6.5 13.6H1.5z',
};

const ARMOR = {
  male: 'M8 3l4 2.2L16 3l5 4-3 3-2-1.1V21H8V8.9L6 10 3 7z',
  female: 'M9 3h6l1.2 4-2.2 3 5 11H5l5-11-2.2-3z',
  unisex: 'M7 3h10l3.5 6.2-3.5 1V21H7V10.2L3.5 9.2z',
  morgana: 'M4 3.5l5 4.3h6l5-4.3V14a8 8 0 0 1-16 0z M8.2 12.2a1.6 1.6 0 1 0 .01 0z M15.8 12.2a1.6 1.6 0 1 0 .01 0z',
} as const;

const ACCESSORY = 'M12 2l3 3-3 3-3-3z M12 8.5a7 7 0 1 0 .01 0z M12 10.8a4.7 4.7 0 1 1-.01 0z';
export const SKILL_CARD_PATH = 'M5 1h14v22H5z M12 6l1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 14.2l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z';
/** Item sin tipo confirmado: signo de pregunta */
const UNKNOWN = 'M12 2a10 10 0 1 0 .01 0z M12 6.2c-2.3 0-3.8 1.4-3.9 3.4h2.3c.1-.9.7-1.4 1.6-1.4s1.5.5 1.5 1.3c0 .7-.3 1.1-1.3 1.7-1.2.7-1.6 1.5-1.5 2.9h2.2c0-.8.3-1.2 1.3-1.8 1.1-.7 1.7-1.6 1.7-2.9 0-1.9-1.6-3.2-3.9-3.2z M11 15.6h2.3v2.3H11z';

function pathFor(it: ItemInfo): string {
  switch (it.type) {
    case 'melee':
      return it.owner ? MELEE[it.owner] : MELEE.joker;
    case 'gun':
      return it.owner ? GUN[it.owner] : GUN.joker;
    case 'armor':
      return ARMOR[it.gender ?? 'unisex'];
    case 'accessory':
      return ACCESSORY;
    case 'skillcard':
      return SKILL_CARD_PATH;
    default:
      return UNKNOWN;
  }
}

export function ItemIcon({ item, size = 44 }: { item: ItemInfo; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#E5161D" fillRule="evenodd" d={pathFor(item)} />
    </svg>
  );
}
