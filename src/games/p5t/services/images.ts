/** Arte oficial de cada Persona, sacado de los archivos del juego (persona_ore_XXX, mismo id que los datos). */
const files = import.meta.glob('../assets/personas/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const ART = Object.fromEntries(Object.entries(files).map(([p, url]) => [p.split('/').pop()!.replace('.webp', ''), url]));

export const personaImage = (id: string): string | undefined => ART[id];

/** Retratos de los Ladrones (pose normal) y el arte de su Persona, sacados del juego. */
const partyFiles = import.meta.glob('../assets/party/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const PARTY = Object.fromEntries(Object.entries(partyFiles).map(([p, url]) => [p.split('/').pop()!.replace('.webp', ''), url]));
export const memberImage = (id: string): string | undefined => PARTY[id];
export const memberPersonaImage = (id: string): string | undefined => PARTY[`${id}-persona`];
