import { Fragment, useMemo, useState } from 'react';
import { CalcHeader } from '../components/CalcHeader';
import { PersonaPeek } from '../components/PersonaPeek';
import { getArcana } from '../data/arcana';
import { FORECAST, FORECAST_MONTHS, type Condition, type Effect, type ForecastDay } from '../services/forecast';
import { getPersona } from '../services/personas';
import { personaName, skillName } from '../services/text';
import type { ArcanaId } from '../types';
import styles from './Forecast.module.css';
import { L } from '../../../i18n';

type Filter = 'all' | 'skill' | 'stats' | 'skillChange' | 'linkExp';
const MONTHS = (): Record<number, string> => ({
  4: L('Abril', 'April'), 5: L('Mayo', 'May'), 6: L('Junio', 'June'), 7: L('Julio', 'July'), 8: L('Agosto', 'August'),
  9: L('Septiembre', 'September'), 10: L('Octubre', 'October'), 11: L('Noviembre', 'November'), 12: L('Diciembre', 'December'),
  1: L('Enero', 'January'), 2: L('Febrero', 'February'), 3: L('Marzo', 'March'),
});
const KIND = (): Record<string, string> => ({
  recovery: L('una skill de curación', 'a recovery skill'), wind: L('una skill de viento', 'a wind skill'),
  ice: L('una skill de hielo', 'an ice skill'), fire: L('una skill de fuego', 'a fire skill'),
  elec: L('una skill eléctrica', 'an electric skill'), support: L('una skill de apoyo', 'a support skill'),
});

const P = ({ id }: { id: string }) => {
  const p = getPersona(id);
  return p ? <PersonaPeek persona={p} /> : <>{id}</>;
};
const arcanaName = (a: string) => getArcana(a as ArcanaId).name;
const join = (items: React.ReactNode[]) => items.map((x, i) => <Fragment key={i}>{i > 0 && L(' y ', ' and ')}{x}</Fragment>);

function ConditionText({ c }: { c: Condition | null }) {
  if (!c) return <>{L('Cualquier fusión', 'Any fusion')}</>;
  switch (c.type) {
    case 'result': return <>{L('Crear', 'Create')} <P id={c.persona} /></>;
    case 'resultArcana': return <>{L(`Crear una Persona de ${arcanaName(c.arcana)}`, `Create a ${arcanaName(c.arcana)} Persona`)}</>;
    case 'material': return <>{L('Usar', 'Use')} {join(c.personas.map((p) => <P key={p} id={p} />))} {L(c.personas.length > 1 ? 'como ingredientes' : 'como ingrediente', c.personas.length > 1 ? 'as ingredients' : 'as an ingredient')}</>;
    case 'materialArcana': return <>{L('Usar', 'Use')} {join(c.arcanas.map((a) => L(`una Persona de ${arcanaName(a)}`, `a ${arcanaName(a)} Persona`)))} {L(c.arcanas.length > 1 ? 'como ingredientes' : 'como ingrediente', c.arcanas.length > 1 ? 'as ingredients' : 'as an ingredient')}</>;
  }
}

const effectText = (e: Effect): string => {
  switch (e.type) {
    case 'stats': return L('Suben los atributos', 'Stats increase');
    case 'skillChange': return L('Puede cambiar una skill', 'A skill may change');
    case 'linkExp': return L('Más EXP por vínculos', 'More Social Link EXP');
    case 'skill': return L(`Aprende ${skillName(e.skill)}`, `Learns ${skillName(e.skill)}`);
    case 'skillKind': return L(`Aprende ${KIND()[e.kind]}`, `Learns ${KIND()[e.kind]}`);
  }
};
const matches = (d: ForecastDay, f: Filter) =>
  f === 'all' || d.effects.some((e) => (f === 'skill' ? e.type === 'skill' || e.type === 'skillKind' : e.type === f));
const mentions = (d: ForecastDay, q: string) => {
  const c = d.condition;
  const ids = !c ? [] : c.type === 'result' ? [c.persona] : c.type === 'material' ? c.personas : [];
  const names = ids.map((id) => { const p = getPersona(id); return p ? personaName(p) : id; });
  const skills = d.effects.flatMap((e) => (e.type === 'skill' ? [skillName(e.skill)] : []));
  return [...names, ...skills].some((s) => s.toLowerCase().includes(q));
};

/** Pronóstico de fusiones: qué fusión da bonus cada día (exclusivo del Golden). */
export default function Forecast() {
  const [month, setMonth] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const months = MONTHS();
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORECAST.filter((d) => (month === null || d.month === month) && matches(d, filter) && (!q || mentions(d, q)));
  }, [month, filter, query]);

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: L('Todos', 'All') },
    { id: 'skill', label: L('Aprende skill', 'Learns a skill') },
    { id: 'stats', label: L('Atributos', 'Stats') },
    { id: 'skillChange', label: L('Cambio de skill', 'Skill change') },
    { id: 'linkExp', label: L('EXP de vínculos', 'Link EXP') },
  ];

  return (
    <>
      <CalcHeader />
      <div className={`container ${styles.page}`}>
        <p className={styles.lead}>
          {L('En la Velvet Room, cada día tiene su pronóstico: si la fusión cumple la condición, la Persona sale con un bonus (una skill extra, más atributos, un cambio de skill o más EXP por vínculos). Los días que no aparecen no tienen pronóstico.', 'In the Velvet Room each day has its forecast: if the fusion meets the condition, the Persona comes out with a bonus (an extra skill, higher stats, a skill change or more Social Link EXP). Days not listed have no forecast.')}
        </p>
        <div className={styles.controls}>
          <label className={styles.field}>
            <span className="label label-accent">{L('Mes', 'Month')}</span>
            <select value={month ?? ''} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : null)}>
              <option value="">{L('Todos los meses', 'All months')}</option>
              {FORECAST_MONTHS.map((m) => <option key={m} value={m}>{months[m]}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span className="label label-accent">{L('Buscar Persona o skill', 'Search Persona or skill')}</span>
            <input type="search" value={query} placeholder={L('Ej: Jack Frost', 'E.g.: Jack Frost')} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className={styles.chips} role="group" aria-label={L('Tipo de bonus', 'Bonus type')}>
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className={styles.chip} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
          </div>
        </div>

        <div className={styles.list}>
          {list.map((d, i) => (
            <Fragment key={`${d.month}-${d.day}`}>
              {(i === 0 || list[i - 1].month !== d.month) && <h2 className={styles.monthHead}>{months[d.month]}</h2>}
              <article className={styles.row} data-open={!d.condition}>
                <div className={styles.date}>
                  <span className={styles.day}>{d.day}</span>
                  <span className={styles.month}>{months[d.month].slice(0, 3)}</span>
                </div>
                <div className={styles.body}>
                  <p className={styles.cond}><span className={styles.condLabel}>{L('Condición', 'Condition')}</span><ConditionText c={d.condition} /></p>
                  <ul className={styles.effects}>
                    {d.effects.map((e, n) => (
                      <li key={n} className={styles.effect} data-kind={e.type === 'skillKind' ? 'skill' : e.type}>{effectText(e)}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Fragment>
          ))}
          {!list.length && <p className={styles.lead}>{L('No hay días con esos filtros.', 'No days match those filters.')}</p>}
        </div>
        <p className={styles.credit}>{L('Fechas, condiciones y bonus: Megami Tensei Wiki. Nombres: textos oficiales del juego.', 'Dates, conditions and bonuses: Megami Tensei Wiki. Names: official game text.')}</p>
      </div>
    </>
  );
}
