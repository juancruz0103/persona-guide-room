import { Link } from 'react-router-dom';
import { GAMES } from '../../core/games';
import type { GameId } from '../../core/types';
import { es } from '../../i18n/es';
import styles from './GameMenu.module.css';

interface Props {
  id: string;
  current: GameId;
  onClose: () => void;
}

/** Panel del menú hamburguesa para cambiar de juego. */
export function GameMenu({ id, current, onClose }: Props) {
  return (
    <div id={id} className={styles.panel}>
      <span className="label label-accent">{es.gameMenu.title}</span>
      <ul className={styles.list}>
        {GAMES.map((g) => {
          const isCurrent = g.id === current;
          const content = (
            <>
              <span className={styles.name}>
                <span className={styles.swatch} style={{ background: g.swatch }} aria-hidden="true" />
                {g.name}
              </span>
              {isCurrent && <span className={`tag ${styles.tagCurrent}`}>{es.gameMenu.current}</span>}
              {!g.available && <span className="tag tag--outline">{es.gameMenu.soon}</span>}
            </>
          );
          return (
            <li key={g.id}>
              {g.available ? (
                <Link
                  to={`/${g.id}`}
                  className={`${styles.item} ${isCurrent ? styles.current : ''}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={onClose}
                >
                  {content}
                </Link>
              ) : (
                <span className={`${styles.item} ${styles.disabled}`} aria-disabled="true">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className={styles.note}>{es.gameMenu.note}</p>
    </div>
  );
}
