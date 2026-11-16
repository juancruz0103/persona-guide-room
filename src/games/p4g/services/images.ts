/**
 * Ilustraciones oficiales de las Personas, sacadas de los archivos del juego
 * (camp/persona/pst_XXX.tmx, ver scripts/p4g-extract). Hay una por Persona:
 * en el catálogo se muestra tal cual y en la ficha se espeja con CSS.
 */
const files = import.meta.glob('../assets/personas/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const PERSONAS = Object.fromEntries(Object.entries(files).map(([p, url]) => [p.split('/').pop()!.replace('.webp', ''), url]));

export const personaImage = (id: string): string | undefined => PERSONAS[id];
