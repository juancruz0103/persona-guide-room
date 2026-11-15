import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/account/AuthContext';
import { useFavorites } from '../../../core/account/favorites';
import styles from './FavoriteButton.module.css';
import { useGameBase } from '../../../shared/hooks/useGameBase';
import { L } from '../../../i18n';

/** Estrella para marcar una Persona como favorita. Sin sesión, lleva a iniciar sesión. */
export function FavoriteButton({ personaId }: { personaId: string }) {
  const { user } = useAuth();
  const base = useGameBase();
  const { isFavorite, toggle, loading } = useFavorites();
  const location = useLocation();

  if (!user) {
    return (
      <Link to={`${base}/cuenta`} state={{ from: location.pathname }} className={styles.btn}>
        <Star filled={false} /> {L('Entrá para guardar en favoritas', 'Log in to save to favorites')}
      </Link>
    );
  }
  const on = isFavorite(personaId);
  return (
    <button
      type="button"
      className={`${styles.btn} ${on ? styles.on : ''}`}
      aria-pressed={on}
      disabled={loading}
      onClick={() => void toggle(personaId)}
    >
      <Star filled={on} /> {on ? L('En favoritas', 'In favorites') : L('Agregar a favoritas', 'Add to favorites')}
    </button>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}
