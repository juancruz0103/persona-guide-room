import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pendingReports } from '../../core/account/builds';
import { useAuth } from '../../core/account/AuthContext';
import styles from './LanguageButton.module.css';
import { L } from '../../i18n';
import { useGameBase } from '../hooks/useGameBase';

/** Botón de la cabecera: «Entrar» o acceso a «Mi perfil». */
export function AccountButton() {
  const base = useGameBase();
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [pending, setPending] = useState(0);
  const admin = !!profile?.is_admin;
  useEffect(() => {
    if (!admin) return setPending(0);
    const load = () => void pendingReports().then(setPending);
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [admin, location.pathname]);
  if (loading) return null;
  if (!user) {
    return (
      <Link to={`${base}/cuenta`} state={{ from: location.pathname }} className={styles.button} style={{ textDecoration: 'none', textTransform: 'uppercase' }}>
        {L('Entrar', 'Log in')}
      </Link>
    );
  }
  return (
    <Link
      to={`${base}/perfil`}
      className={styles.button}
      style={{ textDecoration: 'none', textTransform: 'uppercase' }}
      title={profile?.is_admin ? L('Mi perfil · Administrador', 'My profile · Administrator') : L('Mi perfil', 'My profile')}
    >
      {profile?.is_admin ? (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-label={L('Administrador', 'Administrator')} role="img" style={{ color: 'var(--c-primary-light)' }}>
          <path fill="currentColor" d="M3 18h18l1-11-5.5 4L12 4 7.5 11 2 7z" />
          <rect x="3" y="19.5" width="18" height="2" fill="currentColor" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
      )}
      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {profile?.username ?? L('Mi perfil', 'My profile')}
      </span>
      {pending > 0 && (
        <span
          title={L(`${pending} reporte${pending === 1 ? '' : 's'} sin revisar`, `${pending} unreviewed report${pending === 1 ? '' : 's'}`)}
          style={{ minWidth: 22, height: 22, padding: '0 6px', display: 'inline-grid', placeItems: 'center', background: 'var(--c-primary)', color: 'var(--c-text)', fontSize: 13, borderRadius: 11 }}
        >
          {pending}
        </span>
      )}
    </Link>
  );
}
