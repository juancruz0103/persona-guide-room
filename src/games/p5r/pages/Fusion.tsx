import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { CalculatorHeader } from '../components/CalculatorHeader';
import { getArcana } from '../data/arcana';
import { getAllPersonas, getPersona } from '../services/personas';
import styles from './Fusion.module.css';

/**
 * Pantalla de fusión.
 * ⚠️ El motor de fusiones todavía no existe (Etapa 3): esta pantalla muestra
 * la interfaz, pero NO calcula resultados. No se muestra ningún resultado inventado.
 */
export default function Fusion() {
  const personas = [...getAllPersonas()].sort((a, b) => a.name.localeCompare(b.name));
  const [a, setA] = useState(personas[0]?.id ?? '');
  const [b, setB] = useState(personas[1]?.id ?? '');
  const [includeDlc, setIncludeDlc] = useState(true);
  const [includeTreasure, setIncludeTreasure] = useState(true);
  const [params] = useSearchParams();
  const reverseRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.get('modo') === 'inversa') {
      reverseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      reverseRef.current?.querySelector('input')?.focus({ preventScroll: true });
    }
  }, [params]);

  const slot = (id: string, setId: (v: string) => void, n: 1 | 2) => {
    const p = getPersona(id);
    return (
      <div className={styles.slot}>
        <label htmlFor={`p${n}`} className="label label-accent">Persona {n}</label>
        <select id={`p${n}`} value={id} onChange={(e) => setId(e.target.value)} className={styles.select}>
          {personas
            .filter((x) => includeDlc || !x.flags.dlc)
            .map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} — {getArcana(x.arcana).name} · Nv {x.level}
              </option>
            ))}
        </select>
        {p && (
          <ImagePlaceholder
            className={styles.slotImage}
            label={p.name}
            hint={`${getArcana(p.arcana).name} · Nv ${p.level}`}
            corner={getArcana(p.arcana).numeral}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <CalculatorHeader />

      <section className={`container ${styles.fuse}`}>
        <div className={styles.options}>
          <label className={styles.check}>
            <input type="checkbox" checked={includeDlc} onChange={(e) => setIncludeDlc(e.target.checked)} />
            Incluir Personas DLC
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={includeTreasure} onChange={(e) => setIncludeTreasure(e.target.checked)} />
            Incluir Treasure Demons
          </label>
        </div>

        <div className={styles.equation}>
          {slot(a, setA, 1)}
          <span className={styles.op} aria-hidden="true">+</span>
          {slot(b, setB, 2)}
          <span className={`${styles.op} ${styles.eq}`} aria-hidden="true">=</span>
          <div className={styles.slot}>
            <span className="label label-accent">Resultado</span>
            <div className={styles.result} role="status">
              <span className={styles.q}>?</span>
              <span>Acá aparece la Persona resultante, con imagen, Arcana, nivel y acceso a su ficha.</span>
              <small>El cálculo real llega con el motor de fusiones (Etapa 3).</small>
            </div>
          </div>
        </div>
      </section>

      <section ref={reverseRef} id="inversa" className={styles.reverse}>
        <div className="container">
          <SectionTitle size="md">¿Cómo consigo una Persona?</SectionTitle>
          <div className={styles.search}>
            <label htmlFor="target" className="label label-accent">Persona que querés obtener</label>
            <input id="target" type="search" list="personas-list" placeholder="Ej: Abaddon" className={styles.select} />
            <datalist id="personas-list">
              {personas.map((p) => <option key={p.id} value={p.name} />)}
            </datalist>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Ingrediente 1</th>
                  <th scope="col">Ingrediente 2</th>
                  <th scope="col">Niveles</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={3}>
                    Las combinaciones posibles se listan acá, ordenadas por nivel, cuando esté el motor de fusiones
                    (Etapa 3).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
