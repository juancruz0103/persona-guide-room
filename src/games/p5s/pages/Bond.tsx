import { useState } from 'react';
import { BOND_ROWS, BOND_SKILLS, type BondRow, type BondSkill } from '../data/bond';
import styles from './Bond.module.css';

const ICONS = import.meta.glob('../assets/bond/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const icon = (id: string) => ICONS[`../assets/bond/${id}.webp`];
import { L, isEn } from '../../../i18n';

/** Agrupa niveles seguidos con el mismo costo: Nv 1–3 · 3 pts. */
function groups(costs: number[]) {
  const out: { from: number; to: number; cost: number }[] = [];
  costs.forEach((c, i) => {
    const last = out[out.length - 1];
    if (last && last.cost === c) last.to = i + 1;
    else out.push({ from: i + 1, to: i + 1, cost: c });
  });
  return out;
}

function Card({ s }: { s: BondSkill }) {
  const per = L(s.perLevelEs ?? '', s.perLevelEn ?? '');
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        {icon(s.id) && <span className={styles.icon}><img src={icon(s.id)} alt="" loading="lazy" /></span>}
        <div>
          <h3 className={styles.name}>{L(s.nameEs, s.nameEn)}</h3>
          {!isEn() && <span className={styles.alt}>{s.nameEn}{s.official && <> · <span className={styles.official}>{L('Texto oficial', 'Official text')}</span></>}</span>}
        </div>
      </div>
      <p className={styles.desc}>{L(s.descEs, s.descEn)}</p>
      {per && <p className={styles.desc}>{L('Cada nivel', 'Each level')}: <strong>{per}</strong></p>}
      <div className={styles.levels} aria-label={L('Costo por nivel', 'Cost per level')}>
        {s.costs.length
          ? groups(s.costs).map((g) => (
              <span key={g.from} className={styles.lv}>
                <b>{L('Nv', 'Lv')} {g.from === g.to ? g.from : `${g.from}–${g.to}`}</b>{g.cost} pts{g.from !== g.to && L(' c/u', ' each')}
              </span>
            ))
          : <span className={styles.lv}>{L(`${s.maxLevel} niveles, de 2 a 6 pts cada uno`, `${s.maxLevel} levels, 2 to 6 pts each`)}</span>}
      </div>
      <div className={styles.meta}>
        <span>{L(s.unlockEs, s.unlockEn)}</span>
        <span className={styles.total}>{L('Total', 'Total')}: {s.total} pts</span>
      </div>
    </article>
  );
}

/** VÍNCULO de Strikers: qué da cada habilidad, cuánto cuesta cada nivel y cómo se desbloquea. */
export default function Bond() {
  const [row, setRow] = useState<BondRow | 'all'>('all');
  const rows = BOND_ROWS.filter((r) => row === 'all' || r.id === row);
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>{L('Vínculo', 'Bond')}</h1>
          <p className={styles.lead}>
            {L('Strikers no tiene confidentes: el equipo comparte un nivel de VÍNCULO. Con cada nivel ganás puntos para mejorar estas 30 habilidades. Llevarlas todas al máximo cuesta 1449 puntos.',
              "Strikers has no Confidants: the team shares a BOND level. Each level gives points to upgrade these 30 skills. Maxing them all costs 1449 points.")}
          </p>
        </div>
      </section>
      <div className={`container ${styles.page}`}>
        {!isEn() && (
          <p className={styles.notice}>
            Los nombres y descripciones en español son una traducción nuestra hasta cargar los del juego. Las marcadas como «Texto oficial» ya son los del juego. Costos: Megami Tensei Wiki; desbloqueos: Samurai Gamers.
          </p>
        )}
        <div className={styles.filters}>
          <button type="button" className={`btn ${row === 'all' ? 'btn--dark' : 'btn--light'}`} onClick={() => setRow('all')}>{L('Todas', 'All')}</button>
          {BOND_ROWS.map((r) => (
            <button key={r.id} type="button" className={`btn ${row === r.id ? 'btn--dark' : 'btn--light'}`} onClick={() => setRow(r.id)}>{L(r.es, r.en)}</button>
          ))}
        </div>
        {rows.map((r) => (
          <section key={r.id} className={styles.row}>
            <h2 className={styles.rowTitle}>{L(r.es, r.en)}</h2>
            <div className={styles.grid}>{BOND_SKILLS.filter((s) => s.row === r.id).map((s) => <Card key={s.id} s={s} />)}</div>
          </section>
        ))}
      </div>
    </>
  );
}
