/**
 * Fotos sacadas del juego por Juan. Vite solo incluye las que existen,
 * así que donde todavía no hay foto se sigue viendo el marcador.
 */
const confidantFiles = import.meta.glob('../assets/confidants/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const personaFiles = import.meta.glob('../assets/personas/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byName = (files: Record<string, string>) =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.webp', ''), url]));

const CONFIDANTS = byName(confidantFiles);
const PERSONAS = byName(personaFiles);

/** Silueta del confidente (pantalla de habilidades del juego). */
export const confidantImage = (id: string): string | undefined => CONFIDANTS[id];

/**
 * Foto de una Persona. «profile» = mirando a la derecha (ficha);
 * «side» = mirando a la izquierda (calculadora y tarjetas).
 */
export const personaImage = (id: string, view: 'profile' | 'side'): string | undefined =>
  PERSONAS[`${id}-${view === 'profile' ? 'de' : 'iz'}`];

/** Encuadre en las tarjetas del catálogo: por defecto 50% 30%; algunas fotos necesitan mostrar más arriba. */
const CARD_FOCUS: Record<string, string> = {
  'cu-chulainn': '50% 0%',
  'fuu-ki': '50% 0%', // con aire agregado arriba (recortes.json)
};
export const personaCardFocus = (id: string): string => CARD_FOCUS[id] ?? '50% 30%';
