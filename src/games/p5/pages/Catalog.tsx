import { useMemo } from 'react';
import { useSessionState } from '../../../shared/hooks/useSessionState';
import { CalculatorHeader } from '../components/CalculatorHeader';
import { PersonaCard } from '../components/PersonaCard';
import { ARCANAS } from '../../p5r/data/arcana';
import type { ArcanaId } from '../../p5r/types';
import {
  DEFAULT_FILTERS,
  filterPersonas,
  getCatalogPersonas,
  type CatalogFilters,
  type SortKey,
} from '../services/personas';
import styles from '../../p5r/pages/Catalog.module.css';
import { L } from '../../../i18n';

/** P5 original no tiene Fe, Consejero ni Mundo. */
const USED_ARCANAS = new Set(getCatalogPersonas().map((p) => p.arcana));

export default function Catalog() {
  const [f, setF] = useSessionState<CatalogFilters>('p5.catalog.filters', DEFAULT_FILTERS);
  const all = getCatalogPersonas();
  const [spoilerFilters, setSpoilerFilters] = useSessionState('p5.catalog.spoilerFilters', false);
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
            <label htmlFor="q" className="label label-accent">{L('Buscar por nombre', 'Search by name')}</label>
            <input
              id="q"
              type="search"
              placeholder={L('Ej: Alice o Capitán Kidd', 'E.g.: Alice or Captain Kidd')}
              value={f.query}
              onChange={(e) => set('query', e.target.value)}
              className={styles.input}
            />
          </div>

          <fieldset className={styles.group}>
            <legend className="label label-accent">Arcana</legend>
            <div className={styles.chips}>
              {ARCANAS.filter((a) => USED_ARCANAS.has(a.id)).map((a) => {
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
                {L('Quitar filtro de Arcana', 'Clear Arcana filter')}
              </button>
            )}
          </fieldset>

          <fieldset className={styles.group}>
            <legend className="label label-accent">{L('Nivel', 'Level')}</legend>
            <div className={styles.levels}>
              <label htmlFor="lmin">{L('de', 'from')}</label>
              <input id="lmin" type="number" min={1} max={99} value={f.minLevel}
                onChange={(e) => set('minLevel', clampLevel(e.target.value))} className={styles.input} />
              <label htmlFor="lmax">{L('a', 'to')}</label>
              <input id="lmax" type="number" min={1} max={99} value={f.maxLevel}
                onChange={(e) => set('maxLevel', clampLevel(e.target.value))} className={styles.input} />
            </div>
          </fieldset>

          <fieldset className={`${styles.group} ${styles.options}`}>
            <legend className="label label-accent">{L('Opciones', 'Options')}</legend>
            <label className={styles.check}>
              <input type="checkbox" checked={f.includeDlc} onChange={(e) => set('includeDlc', e.target.checked)} />
              {L('Incluir Personas DLC', 'Include DLC Personas')}
            </label>
            <label className={styles.check}>
              <input type="checkbox" checked={f.includeTreasure} onChange={(e) => set('includeTreasure', e.target.checked)} />
              {L('Incluir Treasure Demons', 'Include Treasure Demons')}
            </label>
          </fieldset>

          <fieldset className={`${styles.group} ${styles.options}`}>
            <legend className="label label-accent">{L('Personas de compañeros', 'Party Personas')}</legend>
            <p className={styles.note}>{L('Las Personas de los Ladrones Fantasma. Tienen ficha pero no se fusionan.', "The Phantom Thieves' Personas. They have a profile but can't be fused.")}</p>
            <button
              type="button"
              aria-pressed={!!f.partyOnly}
              className={`${styles.partyOnlyBtn} ${f.partyOnly ? styles.partyOnlyOn : ''}`}
              onClick={() => set('partyOnly', !f.partyOnly)}
            >
              {f.partyOnly ? L('✓ Solo compañeros', '✓ Party only') : L('Ver solo compañeros', 'Show party only')}
            </button>
            <label className={styles.check}>
              <input type="checkbox" checked={f.partyInitial} onChange={(e) => set('partyInitial', e.target.checked)} />
              {L('Iniciales', 'Initial')}
            </label>
            {spoilerFilters ? (
              <>
                <label className={styles.check}>
                  <input type="checkbox" checked={f.partyEvolved} onChange={(e) => set('partyEvolved', e.target.checked)} />
                  {L('Evolucionadas', 'Evolved')}
                </label>
              </>
            ) : (
              <button
                type="button"
                className={styles.spoilerBtn}
                onClick={() => {
                  setSpoilerFilters(true);
                  setF((prev) => ({ ...prev, partyEvolved: true }));
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-2.6 3.2" />
                  <path d="M6.5 7.6C4.3 9.2 3 12 3 12s4 6 9 6a8.7 8.7 0 0 0 4-1" />
                </svg>
                {L('Más filtros · contiene spoilers', 'More filters · contains spoilers')}
              </button>
            )}
          </fieldset>
        </aside>

        <section className={styles.results} aria-live="polite">
          <div className={styles.toolbar}>
            <span>
              {L('Mostrando', 'Showing')} <strong>{list.length}</strong> Personas
            </span>
            <label className={styles.sort}>
              {L('Ordenar por', 'Sort by')}
              <select value={f.sort} onChange={(e) => set('sort', e.target.value as SortKey)} className={styles.input}>
                <option value="level-asc">{L('Nivel (menor a mayor)', 'Level (low to high)')}</option>
                <option value="level-desc">{L('Nivel (mayor a menor)', 'Level (high to low)')}</option>
                <option value="name-asc">{L('Nombre (A–Z)', 'Name (A–Z)')}</option>
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
            <p className="pending">
              {f.partyOnly && !f.partyInitial && !f.partyEvolved
                ? L('Marcá al menos una forma (iniciales o evolucionadas) para ver Personas de compañeros.', 'Select at least one form (initial or evolved) to see party Personas.')
                : L('No hay Personas con esos filtros.', 'No Personas match those filters.')}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
