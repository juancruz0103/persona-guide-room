import type { GameId, GameInfo } from './types';
import { p5rGame } from '../games/p5r/config';
import { p3rGame } from '../games/p3r/config';
import { p4gGame } from '../games/p4g/config';
import { p5Game } from '../games/p5/config';
import { p5sGame } from '../games/p5s/config';
import { p5tGame } from '../games/p5t/config';

/**
 * Registro de juegos.
 * Para sumar un juego: crear src/games/<id>/config.ts y agregarlo acá.
 */
export const GAMES: GameInfo[] = [
  p5rGame,
  p5Game,
  p5sGame,
  p5tGame,
  p3rGame,
  p4gGame,
];

export const DEFAULT_GAME: GameId = 'p5r';

export function getGame(id: string | undefined): GameInfo | undefined {
  return GAMES.find((g) => g.id === id);
}
