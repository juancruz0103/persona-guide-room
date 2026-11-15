import type { GameId, GameInfo } from './types';
import { p5rGame } from '../games/p5r/config';
import { p3rGame } from '../games/p3r/config';

/**
 * Registro de juegos.
 * Para sumar un juego: crear src/games/<id>/config.ts y agregarlo acá.
 */
export const GAMES: GameInfo[] = [
  p5rGame,
  p3rGame,
  {
    id: 'p4g',
    name: 'Persona 4 Golden',
    shortName: 'P4 GOLDEN',
    available: false,
    swatch: '#F2C230',
    tools: [],
  },
];

export const DEFAULT_GAME: GameId = 'p5r';

export function getGame(id: string | undefined): GameInfo | undefined {
  return GAMES.find((g) => g.id === id);
}
