import { useMemo } from 'react';
import { useSessionState } from '../../../shared/hooks/useSessionState';
import { CalcHeader } from '../components/CalcHeader';
import { PersonaCard } from '../components/PersonaCard';
import { ARCANAS } from '../data/arcana';
import type { ArcanaId } from '../types';
import { DEFAULT_FILTERS, filterPersonas, getAllPersonas, type CatalogFilters } from '../services/personas';
import styles from '../../p5r/pages/Catalog.module.css';
import { L } from '../../../i18n';

export default function Catalog() {
  const [f, setF] = useSessionState<CatalogFilters>('p4g.catalog.filters', DEFAULT_FILTERS);
  const list = useMemo(() => filterPersonas(getAllPersonas(), f), [f]);
  const set = <K extends keyof CatalogFilters>(k: K, v: CatalogFilters[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggleArcana = (id: ArcanaId) =>
    set('arcanas', f.arcanas.includes(id) ? f.arcanas.filter((a) => a !== id) : [...f.arcanas, id]);
  const clamp = (v: string) => Math.min(99, Math.max(1, Number(v) || 1));

  return (
    <>
      <CalcHeader />
      <div className={`container ${styles.layout}`}>
        <aside className={styles.filters} aria-label={L('Filtros', 'Filters')}>
          <div className={styles.group}>
            <label htmlFor="q" className="label label-accent">{L('Buscar por nombre', 'Search by name')}</label>
            <input id="q" type="search" placeholder={L('Ej: Izanagi o Pixie', 'E.g.: Izanagi or Pixie')} value={f.query}
              onChange={(e) => set('query', e.target.value)} className={styles.input} />
          </div>
          <fieldset className={styles.group}>
            <legend className="label label-accent">Arcana</legend>
            <div className={styles.chips}>
              {ARCANAS.map((a) => (
                <button key={a.id} type="button" aria-pressed={f.arcanas.includes(a.id)} onClick={() => toggleArcana(a.id)}
                  className={`${styles.chip} ${f.arcanas.includes(a.id) ? styles.chipOn : ''}`}>{a.name}</button>
              ))}
            </div>
            {f.arcanas.length > 0 && (
              <button type="button" className={styles.clear} onClick={() => set('arcanas', [])}>{L('Quitar filtro de Arcana', 'Clear Arcana filter')}</button>
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
            <legend className="label label-accent">{L('Personas de compañeros', 'Party Personas')}</legend>
            <p className={styles.note}>{L('Las Personas del equipo de investigación tienen ficha, pero no se fusionan.', "The Investigation Team's Personas. They have a profile but can't be fused.")}</p>
            {(['all', 'none', 'only'] as const).map((v) => (
              <label key={v} className={styles.check}>
                <input type="radio" name="party" checked={f.party === v} onChange={() => set('party', v)} />
                {v === 'all' ? L('Mostrar todas', 'Show all') : v === 'none' ? L('Ocultar compañeros', 'Hide party') : L('Solo compañeros', 'Party only')}
              </label>
            ))}
            <label className={styles.check}>
              <input type="checkbox" checked={!!f.evolved} onChange={(e) => set('evolved', e.target.checked)} />
              {L('Mostrar evoluciones · contiene spoilers', 'Show evolutions · contains spoilers')}
            </label>
          </fieldset>
        </aside>
        <section className={styles.results} aria-live="polite">
          <div className={styles.toolbar}>
            <span>{L('Mostrando', 'Showing')} <strong>{list.length}</strong> Personas</span>
            <label className={styles.sort}>
              {L('Ordenar por', 'Sort by')}
              <select value={f.sort} onChange={(e) => set('sort', e.target.value as CatalogFilters['sort'])} className={styles.input}>
                <option value="arcana">Arcana</option>
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
