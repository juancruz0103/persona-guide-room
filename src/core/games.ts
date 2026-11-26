import type { GameId, GameInfo } from './types';
import { p5rGame } from '../games/p5r/config';
import { p3rGame } from '../games/p3r/config';
import { p4gGame } from '../games/p4g/config';
import { p5Game } from '../games/p5/config';
import { p5sGame } from '../games/p5s/config';
import { p5tGame } from '../games/p5t/config';
import { p4rGame } from '../games/p4r/config';
import { PREVIEW_P4R } from './preview';

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
  // Persona 4 Revival: solo en modo vista previa hasta que salga el juego (18/2/2027)
  ...(PREVIEW_P4R ? [p4rGame] : []),
];

export const DEFAULT_GAME: GameId = 'p5r';

export function getGame(id: string | undefined): GameInfo | undefined {
  return GAMES.find((g) => g.id === id);
}
