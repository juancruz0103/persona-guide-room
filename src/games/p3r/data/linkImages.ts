import type { ArcanaId } from '../types';

/**
 * Ilustraciones oficiales del perfil de cada vínculo (menú del juego → vínculos sociales).
 * Extraídas de Xrd777/UI/Camp/Commu/Textures. El Loco tiene 6 versiones: el collage de
 * S.E.E.S. crece a medida que se suman miembros (las últimas son spoiler).
 */
const IMAGES = import.meta.glob('../assets/links/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
const byName = (name: string) => Object.entries(IMAGES).find(([p]) => p.endsWith(`/${name}.webp`))?.[1];

export const linkImage = (arcana: ArcanaId, variant?: number): string | undefined =>
  arcana === 'fool' ? byName(`fool-${variant ?? 1}`) : byName(variant ? `${arcana}-${variant}` : arcana);
