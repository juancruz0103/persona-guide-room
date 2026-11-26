/**
 * Retratos oficiales de los personajes de cada vínculo (camp/bustup y bustup del juego, ver scripts/p4g-extract).
 * Si un vínculo no tiene retrato, se muestra la Persona que se desbloquea al máximo.
 */
const IMAGES = import.meta.glob('../../p4g/assets/links/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const linkImage = (id: string): string | undefined =>
  Object.entries(IMAGES).find(([p]) => p.endsWith(`/${id}.webp`))?.[1];
