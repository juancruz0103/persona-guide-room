/**
 * Fotos de las Personas sacadas del juego por Juan (compendio, limpiadas con
 * scripts/p3r-extract/clean_persona_shot.py). Donde todavía no hay foto se ve el marcador.
 */
const files = import.meta.glob('../assets/personas/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const PERSONAS = Object.fromEntries(Object.entries(files).map(([p, url]) => [p.split('/').pop()!.replace('.webp', ''), url]));

/** «profile» = mirando a la derecha (ficha); «side» = mirando a la izquierda (tarjetas). */
export const personaImage = (id: string, view: 'profile' | 'side' = 'side'): string | undefined =>
  PERSONAS[`${id}-${view === 'profile' ? 'de' : 'iz'}`];

/** Encuadre en las tarjetas del catálogo: por defecto 50% 30%. */
const CARD_FOCUS: Record<string, string> = {
  byakko: '20% 50%',
};
export const personaCardFocus = (id: string) => CARD_FOCUS[id] ?? '50% 30%';

/** Encuadre de la foto grande de la ficha: por defecto centrada; algunas necesitan mostrar más arriba. */
const PROFILE_FOCUS: Record<string, string> = {
  caesar: '50% 0%',
  alice: '50% 0%',
  asura: '50% 0%',
  atropos: '50% 15%',
  thunderbird: '50% 20%',
};
export const personaProfileFocus = (id: string) => PROFILE_FOCUS[id] ?? '50% 50%';
