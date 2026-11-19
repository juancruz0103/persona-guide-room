import { useMemo } from 'react';
import { useSessionState } from '../../../shared/hooks/useSessionState';
import { CalcHeader } from '../components/CalcHeader';
import { PersonaCard } from '../components/PersonaCard';
import type { PersonaType } from '../types';
import { DEFAULT_FILTERS, filterPersonas, getAllPersonas, TYPES, typeName, type CatalogFilters } from '../services/personas';
import styles from '../../p5r/pages/Catalog.module.css';
import { L } from '../../../i18n';

export default function Catalog() {
  const [f, setF] = useSessionState<CatalogFilters>('p5t.catalog.filters', DEFAULT_FILTERS);
  const all = getAllPersonas();
  const list = useMemo(() => filterPersonas(all, f), [all, f]);
  const set = <K extends keyof CatalogFilters>(k: K, v: CatalogFilters[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggleType = (t: PersonaType) => set('types', f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t]);
  const clamp = (v: string) => Math.min(99, Math.max(1, Number(v) || 1));

  return (
    <>
      <CalcHeader />
      <div className={`container ${styles.layout}`}>
        <aside className={styles.filters} aria-label={L('Filtros', 'Filters')}>
          <div className={styles.group}>
            <label htmlFor="q" className="label label-accent">{L('Buscar por nombre', 'Search by name')}</label>
            <input id="q" type="search" placeholder={L('Ej: Jack Frost', 'E.g.: Jack Frost')} value={f.query}
              onChange={(e) => set('query', e.target.value)} className={styles.input} />
          </div>
          <fieldset className={styles.group}>
            <legend className="label label-accent">{L('Tipo', 'Type')}</legend>
            <div className={styles.chips}>
              {TYPES.map((t) => (
                <button key={t} type="button" aria-pressed={f.types.includes(t)} onClick={() => toggleType(t)}
                  className={`${styles.chip} ${f.types.includes(t) ? styles.chipOn : ''}`}>{typeName(t)}</button>
              ))}
            </div>
            {f.types.length > 0 && (
              <button type="button" className={styles.clear} onClick={() => set('types', [])}>{L('Quitar filtro de tipo', 'Clear type filter')}</button>
            )}
          </fieldset>
          <fieldset className={styles.group}>
            <legend className="label label-accent">{L('Nivel', 'Level')}</legend>
            <div className={styles.levels}>
              <label htmlFor="lmin">{L('de', 'from')}</label>
              <input id="lmin" type="number" min={1} max={99} value={f.minLevel} onChange={(e) => set('minLevel', clamp(e.target.value))} className={styles.input} />
              <label htmlFor="lmax">{L('a', 'to')}</label>
              <input id="lmax" type="number" min={1} max={99} value={f.maxLevel} onChange={(e) => set('maxLevel', clamp(e.target.value))} className={styles.input} />
            </div>
          </fieldset>
          <fieldset className={`${styles.group} ${styles.options}`}>
            <legend className="label label-accent">{L('Mostrar', 'Show')}</legend>
            <label className={styles.check}>
              <input type="checkbox" checked={f.dlc} onChange={(e) => set('dlc', e.target.checked)} />
              {L('Personas de DLC (Pícaros y Raoul)', 'DLC Personas (Picaros and Raoul)')}
            </label>
          </fieldset>
        </aside>
        <section className={styles.results} aria-live="polite">
          <div className={styles.toolbar}>
            <span>{L('Mostrando', 'Showing')} <strong>{list.length}</strong> Personas</span>
            <label className={styles.sort}>
              {L('Ordenar por', 'Sort by')}
              <select value={f.sort} onChange={(e) => set('sort', e.target.value as CatalogFilters['sort'])} className={styles.input}>
                <option value="type">{L('Tipo', 'Type')}</option>
                <option value="level-asc">{L('Nivel (menor a mayor)', 'Level (low to high)')}</option>
                <option value="level-desc">{L('Nivel (mayor a menor)', 'Level (high to low)')}</option>
                <option value="name-asc">{L('Nombre (A–Z)', 'Name (A–Z)')}</option>
              </select>
            </label>
          </div>
          {list.length ? (
            <div className={styles.grid}>{list.map((p) => <PersonaCard key={p.id} persona={p} />)}</div>
          ) : (
            <p className="pending">{L('No hay Personas con esos filtros.', 'No Personas match those filters.')}</p>
          )}
        </section>
      </div>
    </>
  );
}
