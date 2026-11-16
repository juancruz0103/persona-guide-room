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
  inugami: '50% 13%',
  'leanan-sidhe': '50% 12%',
  lilim: '50% 6%',
  lilith: '50% 3%',
  nebiros: '50% 8%',
  saturnus: '50% 0%',
  'shiki-ouji': '50% 5%',
  siegfried: '50% 0%',
};
export const personaCardFocus = (id: string) => CARD_FOCUS[id] ?? '50% 30%';

/** Encuadre de la foto grande de la ficha: por defecto centrada; algunas necesitan mostrar más arriba. */
const PROFILE_FOCUS: Record<string, string> = {
  caesar: '50% 0%',
  alice: '50% 0%',
  asura: '50% 0%',
  atropos: '50% 15%',
  thunderbird: '50% 20%',
  clotho: '50% 0%',
  'cu-chulainn': '50% 22%',
  dionysus: '50% 12%',
  'hell-biker': '50% 13%',
  inugami: '50% 25%',
  izanagi: '50% 2%',
  jikokuten: '50% 3%',
  'kikuri-hime': '50% 0%',
  koumokuten: '50% 4%',
  'leanan-sidhe': '50% 6%',
  lilim: '50% 21%',
  lilith: '50% 2%',
  messiah: '50% 0%',
  mishaguji: '50% 0%',
  narcissus: '50% 4%',
  nebiros: '50% 10%',
  nekomata: '50% 6%',
  oberon: '50% 0%',
  odin: '50% 0%',
  okuninushi: '50% 1%',
  orobas: '50% 12%',
  orpheus: '50% 3%',
  'orpheus-telos': '50% 0%',
  'pale-rider': '50% 0%',
  parvati: '50% 3%',
  pisaca: '50% 5%',
  'queen-medb': '50% 4%',
  sarasvati: '50% 2%',
  saturnus: '50% 0%',
  setanta: '50% 7%',
  'shiki-ouji': '50% 6%',
  siegfried: '50% 0%',
  silky: '50% 7%',
  'take-mikazuchi': '50% 0%',
  'take-minakata': '50% 8%',
  'tam-lin': '50% 7%',
  virtue: '50% 1%',
  'white-rider': '50% 6%',
  zouchouten: '50% 0%',
};
export const personaProfileFocus = (id: string) => PROFILE_FOCUS[id] ?? '50% 50%';
