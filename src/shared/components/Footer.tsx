import { Link } from 'react-router-dom';
import { es } from '../../i18n/es';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          {es.footer.disclaimer}
          <br />
          {es.footer.data}
        </p>
        <p>
          <Link to="/p5r/sobre-nosotros">{es.nav.about}</Link> · {es.footer.madeBy} ·{' '}
          <a href="https://github.com/juancruz0103/persona-guide-room">GitHub</a>
        </p>
      </div>
    </footer>
  );
}
