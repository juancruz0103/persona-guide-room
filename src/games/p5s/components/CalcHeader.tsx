import { Link } from 'react-router-dom';
import styles from '../../p5r/components/CalculatorHeader.module.css';
import { L } from '../../../i18n';

/** Encabezado de la calculadora de Strikers. Por ahora solo el catálogo; la fusión se suma cuando esté validada. */
export function CalcHeader() {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>{L('Calculadora de Personas', 'Persona Calculator')}</h1>
        <nav className={styles.tabs} aria-label={L('Secciones de la calculadora', 'Calculator sections')}>
          <Link to="/p5s/calculadora" aria-current="page" className={`btn btn--dark ${styles.tab}`}>{L('Catálogo', 'Catalog')}</Link>
        </nav>
      </div>
    </section>
  );
}
