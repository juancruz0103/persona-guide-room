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
          {es.footer.madeBy} ·{' '}
          <a href="https://github.com/juancruz0103/persona-guide-room">GitHub</a>
        </p>
      </div>
    </footer>
  );
}
