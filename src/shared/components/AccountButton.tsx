import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/account/AuthContext';
import styles from './LanguageButton.module.css';

/** Botón de la cabecera: «Entrar» o acceso a «Mi perfil». */
export function AccountButton() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) {
    return (
      <Link to="/p5r/cuenta" state={{ from: location.pathname }} className={styles.button} style={{ textDecoration: 'none', textTransform: 'uppercase' }}>
        Entrar
      </Link>
    );
  }
  return (
    <Link to="/p5r/perfil" className={styles.button} style={{ textDecoration: 'none', textTransform: 'uppercase' }} title="Mi perfil">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </svg>
      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {profile?.username ?? 'Mi perfil'}
      </span>
    </Link>
  );
}
