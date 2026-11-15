import { useLocation } from 'react-router-dom';
import { GAMES } from '../../core/games';

/** Base del juego actual según la URL («/p3r», «/p5r»…). Si no hay juego, Royal. */
export function useGameBase(): string {
  const first = useLocation().pathname.split('/')[1];
  return GAMES.some((g) => g.id === first) ? `/${first}` : '/p5r';
}
