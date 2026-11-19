import { personaImage as royalImage, personaCardFocus as royalFocus } from '../../p5r/services/images';

/** Fotos propias de Strikers (sacadas del juego por Juan); si no hay, se usa la de Royal. */
const files = import.meta.glob('../assets/personas/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const OWN = Object.fromEntries(Object.entries(files).map(([p, url]) => [p.split('/').pop()!.replace('.webp', ''), url]));

export const personaImage = (id: string, view: 'profile' | 'side' = 'side'): string | undefined =>
  OWN[`${id}-${view === 'profile' ? 'de' : 'iz'}`] ?? royalImage(id, view);

export const personaCardFocus = (id: string): string => royalFocus(id);
