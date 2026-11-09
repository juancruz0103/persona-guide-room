import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { getArcana } from '../data/arcana';
import { CONFIDANTS } from '../services/confidants';
import styles from './Confidants.module.css';

export default function Confidants() {
  const [q, setQ] = useState('');
  const [onlyRomance, setOnlyRomance] = useState(false);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return CONFIDANTS.filter(
      (c) =>
        (!onlyRomance || c.romance) &&
        (!query || c.name.toLowerCase().includes(query) || getArcana(c.arcana).name.toLowerCase().includes(query) ||
          getArcana(c.arcana).nameEn.toLowerCase().includes(query)),
    );
  }, [q, onlyRomance]);

  return (
    <div className={`container ${styles.page}`}>
      <SectionTitle as="h1">Guía de Confidentes</SectionTitle>
      <p className={styles.lead}>
        Primera versión: los 9 Ladrones Fantasma. Ryuji ya tiene un rango de muestra con datos reales; el resto se carga
        en la Etapa 4.
      </p>

      <div className={styles.filters}>
        <label className={styles.search}>
          <span className="label label-accent">Buscar por nombre o Arcana</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: Ryuji o Chariot" />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={onlyRomance} onChange={(e) => setOnlyRomance(e.target.checked)} />
          Solo con ruta romántica
        </label>
      </div>

      <ul className={styles.grid}>
        {list.map((c) => {
          const arcana = getArcana(c.arcana);
          const inner = (
            <>
              <ImagePlaceholder className={styles.portrait} label="Retrato" icon="person" corner={arcana.numeral} />
              <div className={styles.body}>
                <span className={styles.name}>{c.name}</span>
                <span className={styles.arcana}>{arcana.name}</span>
                <span className={styles.tags}>
                  {c.romance && <span className="tag tag--romance">Romance</span>}
                  {c.hasGuide ? (
                    <span className="tag tag--dlc">Muestra disponible</span>
                  ) : (
                    <span className="tag tag--outline">Pendiente</span>
                  )}
                </span>
              </div>
            </>
          );
          return (
            <li key={c.id}>
              {c.hasGuide ? (
                <Link to={c.id} className={styles.card}>{inner}</Link>
              ) : (
                <div className={`${styles.card} ${styles.disabled}`} aria-disabled="true">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
      {!list.length && <p className="pending">No hay confidentes con esos filtros.</p>}
    </div>
  );
}
