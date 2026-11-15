import { L } from '../../i18n';
import { Link } from 'react-router-dom';
import { t } from '../../i18n/es';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          {t().footer.disclaimer}
        </p>
        <Link to="/p5r/sobre-nosotros" className={styles.about}>
          {t().nav.about} · {L('Contacto y donaciones', 'Contact and donations')} →
        </Link>
      </div>
    </footer>
  );
}
