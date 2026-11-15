import { L } from '../../i18n';
import { Link } from 'react-router-dom';
import { t } from '../../i18n/es';
import styles from './Footer.module.css';
import { useGameBase } from '../hooks/useGameBase';

export function Footer() {
  const base = useGameBase();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          {t().footer.disclaimer}
        </p>
        <Link to={`${base}/sobre-nosotros`} className={styles.about}>
          {t().nav.about} · {L('Contacto y donaciones', 'Contact and donations')} →
        </Link>
        <a href={`${import.meta.env.BASE_URL}privacidad.html${L('', '#en')}`} className={styles.about}>
          {L('Privacidad', 'Privacy')}
        </a>
      </div>
    </footer>
  );
}
