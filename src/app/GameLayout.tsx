import { useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { getGame } from '../core/games';
import { Header } from '../shared/components/Header';
import { Footer } from '../shared/components/Footer';

/**
 * Layout de cada juego: aplica su tema (data-game) y muestra header y footer.
 * Si el juego no existe o todavía no está disponible, vuelve a P5R.
 */
export function GameLayout() {
  const { gameId } = useParams();
  const game = getGame(gameId);

  useEffect(() => {
    if (game) document.documentElement.dataset.game = game.id;
  }, [game]);

  if (!game || !game.available) return <Navigate to="/p5r" replace />;

  return (
    <>
      <a href="#contenido" className="sr-only">Saltar al contenido</a>
      <Header game={game} />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
