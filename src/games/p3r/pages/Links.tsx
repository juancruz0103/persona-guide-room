import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LinkPortrait } from '../components/LinkPortrait';
import { getArcana } from '../data/arcana';
import { DAY_NAMES, scheduleText, type Day } from '../data/links';
import { getAllLinks, progressId } from '../services/links';
import { useAllProgress } from '../../../core/account/progress';
import styles from './Links.module.css';
import { L } from '../../../i18n';

type Sort = 'arcana' | 'sees' | 'progress';
/** Vínculos de integrantes de S.E.E.S. (el grupo y los compañeros con vínculo propio). */
const SEES = new Set(['fool', 'priestess', 'empress', 'lovers', 'judgement', 'aeon']);

/** Lista de los 22 vínculos sociales de Persona 3 Reload. */
export default function Links() {
  const [sort, setSort] = useState<Sort>(() => (sessionStorage.getItem('p3r.links.sort') as Sort) ?? 'arcana');
  const [day, setDay] = useState<'' | Day>('');
  const [romance, setRomance] = useState(false);
  const progress = useAllProgress(getAllLinks().map((l) => progressId(l.arcana)));
  const list = useMemo(() => {
    const rows = getAllLinks()
      .map((l) => ({ l, reached: progress[progressId(l.arcana)] ?? 0 }))
      .filter(({ l }) => (!romance || l.romance) && (day === '' || l.auto || l.days?.includes(day) || (day === 6 && l.holidays)));
    if (sort === 'progress') rows.sort((a, b) => b.reached - a.reached);
    if (sort === 'sees') rows.sort((a, b) => Number(SEES.has(b.l.arcana)) - Number(SEES.has(a.l.arcana)));
    return rows;
  }, [sort, day, romance, progress]);

  const pick = (s: Sort) => {
    setSort(s);
    sessionStorage.setItem('p3r.links.sort', s);
  };

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <span className="label label-accent">{L('Vínculos sociales', 'Social Links')}</span>
        <h1 className={styles.title}>{L('Los 22 vínculos', 'All 22 Social Links')}</h1>
        <p className={styles.lead}>
          {L('Dónde encontrar a cada uno, cómo se desbloquea y qué responder en cada rango. Los diálogos son los oficiales del juego.', 'Where to find each one, how to unlock it and what to answer at each rank. Dialogue is taken from the game.')}
        </p>
      </header>

      <div className={styles.filters}>
        <div className={styles.sorts}>
          <button type="button" className={sort === 'arcana' ? styles.on : ''} onClick={() => pick('arcana')}>{L('Por Arcana', 'By Arcana')}</button>
          <button type="button" className={sort === 'sees' ? styles.on : ''} onClick={() => pick('sees')}>S.E.E.S.</button>
          <button type="button" className={sort === 'progress' ? styles.on : ''} onClick={() => pick('progress')}>{L('Más avanzados', 'Most advanced')}</button>
        </div>
        <label className={styles.select}>
          <span>{L('Día', 'Day')}</span>
          <select value={day} onChange={(e) => setDay(e.target.value === '' ? '' : (Number(e.target.value) as Day))}>
            <option value="">{L('Cualquiera', 'Any')}</option>
            {DAY_NAMES().map((n, i) => <option key={n} value={i}>{n}</option>)}
          </select>
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={romance} onChange={(e) => setRomance(e.target.checked)} />
          {L('Solo con romance', 'Romance only')}
        </label>
      </div>

      <ul className={styles.grid}>
        {list.map(({ l, reached }) => {
          const a = getArcana(l.arcana);
          return (
            <li key={l.arcana}>
              <Link to={l.arcana} className={styles.card}>
                <LinkPortrait arcana={l.arcana} alt={L(l.who[0], l.who[1])} className={styles.photo} compact />
                <div className={styles.body}>
                  <span className={styles.arc}>{a.numeral && `${a.numeral} · `}{a.name}</span>
                  <strong className={styles.who}>{l.spoiler ? L('Spoiler', 'Spoiler') : L(l.who[0], l.who[1])}</strong>
                  <span className={styles.meta}>{l.place ? `${L(l.place[0], l.place[1])} · ` : ''}{scheduleText(l)}</span>
                  <span className={styles.bar} aria-label={L(`Rango ${reached} de 10`, `Rank ${reached} of 10`)}>
                    <i style={{ width: `${reached * 10}%` }} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
