import { useMemo, useState } from 'react';
import { CalculatorHeader } from '../components/CalculatorHeader';
import { PersonaCard } from '../components/PersonaCard';
import { ARCANAS } from '../data/arcana';
import type { ArcanaId } from '../types';
import {
  DEFAULT_FILTERS,
  IS_SAMPLE_DATA,
  filterPersonas,
  getAllPersonas,
  type CatalogFilters,
  type SortKey,
} from '../services/personas';
import styles from './Catalog.module.css';

export default function Catalog() {
  const [f, setF] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const all = getAllPersonas();
  const list = useMemo(() => filterPersonas(all, f), [all, f]);

  const set = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  const toggleArcana = (id: ArcanaId) =>
    set('arcanas', f.arcanas.includes(id) ? f.arcanas.filter((a) => a !== id) : [...f.arcanas, id]);

  const clampLevel = (v: string) => Math.min(99, Math.max(1, Number(v) || 1));

  return (
    <>
      <CalculatorHeader />

      <div className={`container ${styles.layout}`}>
        <aside className={styles.filters} aria-label="Filtros">
          <div className={styles.group}>
            <label htmlFor="q" className="label label-accent">Buscar por nombre</label>
            <input
              id="q"
              type="search"
              placeholder="Ej: Alice"
              value={f.query}
              onChange={(e) => set('query', e.target.value)}
              className={styles.input}
            />
          </div>

          <fieldset className={styles.group}>
            <legend className="label label-accent">Arcana</legend>
            <div className={styles.chips}>
              {ARCANAS.map((a) => {
                const on = f.arcanas.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleArcana(a.id)}
                    className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
            {f.arcanas.length > 0 && (
              <button type="button" className={styles.clear} onClick={() => set('arcanas', [])}>
                Quitar filtro de Arcana
              </button>
            )}
          </fieldset>

          <fieldset className={styles.group}>
            <legend className="label label-accent">Nivel</legend>
            <div className={styles.levels}>
              <label htmlFor="lmin">de</label>
              <input id="lmin" type="number" min={1} max={99} value={f.minLevel}
                onChange={(e) => set('minLevel', clampLevel(e.target.value))} className={styles.input} />
              <label htmlFor="lmax">a</label>
              <input id="lmax" type="number" min={1} max={99} value={f.maxLevel}
                onChange={(e) => set('maxLevel', clampLevel(e.target.value))} className={styles.input} />
            </div>
          </fieldset>

          <fieldset className={`${styles.group} ${styles.options}`}>
            <legend className="label label-accent">Opciones</legend>
            <label className={styles.check}>
              <input type="checkbox" checked={f.includeDlc} onChange={(e) => set('includeDlc', e.target.checked)} />
              Incluir Personas DLC
            </label>
            <label className={styles.check}>
              <input type="checkbox" checked={f.includeTreasure} onChange={(e) => set('includeTreasure', e.target.checked)} />
              Incluir Treasure Demons
            </label>
          </fieldset>
        </aside>

        <section className={styles.results} aria-live="polite">
          {IS_SAMPLE_DATA && (
            <p className={styles.sample}>
              <span className="tag tag--dlc">Muestra</span> Por ahora se ven 14 Personas reales de ejemplo. El
              compendio completo se carga en la Etapa 3.
            </p>
          )}
          <div className={styles.toolbar}>
            <span>
              Mostrando <strong>{list.length}</strong> Personas
            </span>
            <label className={styles.sort}>
              Ordenar por
              <select value={f.sort} onChange={(e) => set('sort', e.target.value as SortKey)} className={styles.input}>
                <option value="level-asc">Nivel (menor a mayor)</option>
                <option value="level-desc">Nivel (mayor a menor)</option>
                <option value="name-asc">Nombre (A–Z)</option>
              </select>
            </label>
          </div>

          {list.length ? (
            <div className={styles.grid}>
              {list.map((p) => (
                <PersonaCard key={p.id} persona={p} />
              ))}
            </div>
          ) : (
            <p className="pending">No hay Personas con esos filtros.</p>
          )}
        </section>
      </div>
    </>
  );
}
