import { Link } from 'react-router-dom';
import { es } from '../../i18n/es';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          {es.footer.disclaimer}
        </p>
        <Link to="/p5r/sobre-nosotros" className={styles.about}>
          {es.nav.about} · Contacto y donaciones →
        </Link>
      </div>
    </footer>
  );
}
