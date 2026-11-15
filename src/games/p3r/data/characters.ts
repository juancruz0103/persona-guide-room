import { L } from '../../../i18n';

/** Personajes que aparecen en las descripciones de equipo ("Para Sanada."). La foto es la misma de su vínculo. */
export interface Character { id: string; name: string }
const LIST: (Character & { aliases: string[] })[] = [
  { id: 'protagonist', name: 'Protagonista', aliases: [''] },
  { id: 'yukari', name: 'Yukari Takeba', aliases: ['Yukari', 'Takeba'] },
  { id: 'junpei', name: 'Junpei Iori', aliases: ['Junpei', 'Iori'] },
  { id: 'akihiko', name: 'Akihiko Sanada', aliases: ['Akihiko', 'Sanada'] },
  { id: 'mitsuru', name: 'Mitsuru Kirijo', aliases: ['Mitsuru', 'Kirijo'] },
  { id: 'fuuka', name: 'Fuuka Yamagishi', aliases: ['Fuuka', 'Yamagishi'] },
  { id: 'aigis', name: 'Aigis', aliases: ['Aigis'] },
  { id: 'ken', name: 'Ken Amada', aliases: ['Ken', 'Amada'] },
  { id: 'koromaru', name: 'Koromaru', aliases: ['Koromaru'] },
  { id: 'shinjiro', name: 'Shinjiro Aragaki', aliases: ['Shinjiro', 'Aragaki'] },
];
export const findCharacter = (token: string): Character | undefined => LIST.find((c) => c.aliases.includes(token.trim()));
export const characterLabel = (c: Character) => (c.id === 'protagonist' ? L('el protagonista', 'the protagonist') : c.name);

/** Caras de la interfaz de combate (las que se ven junto a las barras de PS/PE). Se usan en el equipo. */
const FACES = import.meta.glob('../assets/faces/*.{webp,png,jpg}', { eager: true, import: 'default' }) as Record<string, string>;
export const characterFace = (id: string): string | undefined =>
  Object.entries(FACES).find(([path]) => path.includes(`/faces/${id}.`))?.[1];

/** Fotos de personajes para los vínculos (se suman cuando estén las capturas). */
const PHOTOS = import.meta.glob('../assets/characters/*.{webp,png,jpg}', { eager: true, import: 'default' }) as Record<string, string>;
export const characterPhoto = (id: string): string | undefined =>
  Object.entries(PHOTOS).find(([path]) => path.includes(`/characters/${id}.`))?.[1];
