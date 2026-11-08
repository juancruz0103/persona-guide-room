import { ElementIcon, type IconKey } from '../../../shared/components/ElementIcon';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { AILMENTS, ELEMENTS, TECHNICAL_CHART } from '../data/elements';
import type { SkillElement } from '../types';
import styles from './Technical.module.css';

const ALL_ICONS: SkillElement[] = [
  'phy', 'gun', 'fir', 'ice', 'ele', 'win', 'psy', 'nuk', 'ble', 'cur', 'alm', 'ail', 'rec', 'sup', 'pas',
];

function Chip({ el, gold }: { el: IconKey; gold?: boolean }) {
  const name = el === 'any' ? 'Cualquier elemento' : ELEMENTS[el].name;
  return (
    <span className={`${styles.chip} ${gold ? styles.chipGold : ''}`}>
      <ElementIcon element={el} size={20} />
      {name}
    </span>
  );
}

export default function Technical() {
  return (
    <div className={`container ${styles.page}`}>
      <section>
        <SectionTitle as="h1">Tabla de Técnicos · P5 Royal</SectionTitle>
        <p className={styles.lead}>
          Si el enemigo tiene un estado alterado y lo atacás con uno de estos elementos, hacés un{' '}
          <strong>Técnico</strong>: más daño y, en Royal, chance de derribarlo. La última columna son las
          combinaciones extra que se desbloquean leyendo el libro <strong>Knowing the Heart</strong>.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Técnico con</th>
                <th scope="col">Extra en Royal (Knowing the Heart)</th>
              </tr>
            </thead>
            <tbody>
              {TECHNICAL_CHART.map((r) => (
                <tr key={r.ailment}>
                  <th scope="row">
                    <span className={styles.ailment}>{AILMENTS[r.ailment].es}</span>
                    <span className={styles.en}>{AILMENTS[r.ailment].en}</span>
                  </th>
                  <td>
                    <span className={styles.chips}>
                      {r.base.map((e) => <Chip key={e} el={e} />)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.chips}>
                      {r.knowingTheHeart.length
                        ? r.knowingTheHeart.map((e) => <Chip key={e} el={e} gold />)
                        : <span className={styles.none}>—</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          Fuente: Megami Tensei Wiki (página “Technical”, en inglés). Los nombres de los estados en español son
          provisorios: se reemplazan por los oficiales de la versión en español de España cuando los verifiquemos.
        </p>
      </section>

      <section>
        <SectionTitle tone="accent" size="md">Íconos de elementos</SectionTitle>
        <p className={styles.lead}>Diseño propio, con el mismo código de colores del juego.</p>
        <ul className={styles.icons}>
          {ALL_ICONS.map((el) => (
            <li key={el} className={styles.icon} style={{ borderBottomColor: ELEMENTS[el].color }}>
              <ElementIcon element={el} size={48} />
              <span className="label">{ELEMENTS[el].name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
