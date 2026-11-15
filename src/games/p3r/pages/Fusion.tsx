import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalcHeader } from '../components/CalcHeader';
import { PersonaPicker } from '../components/PersonaPicker';
import { getArcana } from '../data/arcana';
import { getFusionEngine } from '../fusion';
import { personaName } from '../services/text';
import type { Persona } from '../types';
import styles from './Fusion.module.css';
import { L } from '../../../i18n';

function Mini({ p }: { p: Persona }) {
  return (
    <Link to={`/p3r/calculadora/persona/${p.id}`} className={styles.mini}>
      <span className={styles.miniArcana}>{getArcana(p.arcana).name}</span>
      <strong>{personaName(p)}</strong>
      <span className={styles.miniLv}>{L('Nv', 'Lv')} {p.level}</span>
    </Link>
  );
}

export default function Fusion() {
  const [params, setParams] = useSearchParams();
  const reverse = params.get('modo') === 'inversa';
  const [dlc, setDlc] = useState(true);
  const engine = getFusionEngine({ includeDlc: dlc });
  const list = engine.ingredients();
  const a = engine.getById(params.get('a') ?? '');
  const b = engine.getById(params.get('b') ?? '');
  const target = engine.getById(params.get('p') ?? '');
  const [maxLv, setMaxLv] = useState(99);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const result = a && b ? engine.fuse(a, b) : null;
  const special = target ? engine.specialRecipe(target) : null;
  const recipes = useMemo(
    () => (target && !special ? engine.recipesFor(target).filter((r) => r.a.level <= maxLv && r.b.level <= maxLv) : []),
    [engine, target, special, maxLv],
  );
  /** Con A elegida: todo lo que se puede hacer con ella. */
  const withA = useMemo(() => {
    if (!a || b) return [];
    return list
      .map((x) => ({ x, r: engine.fuse(a, x) }))
      .filter((o): o is { x: Persona; r: NonNullable<typeof o.r> } => !!o.r)
      .sort((p, q) => p.r.result.level - q.r.result.level);
  }, [engine, list, a, b]);

  return (
    <>
      <CalcHeader />
      <div className={`container ${styles.page}`}>
        <label className={styles.check}>
          <input type="checkbox" checked={dlc} onChange={(e) => setDlc(e.target.checked)} />
          {L('Incluir Personas DLC', 'Include DLC Personas')}
        </label>

        {!reverse ? (
          <>
            <div className={styles.pickers}>
              <PersonaPicker id="pa" label="Persona A" list={list} value={a?.id ?? ''} onChange={(v) => setParam('a', v)} className={styles.select} />
              <span className={styles.plus}>+</span>
              <PersonaPicker id="pb" label="Persona B" list={list} value={b?.id ?? ''} onChange={(v) => setParam('b', v)} className={styles.select} />
            </div>
            {a && b && (
              <div className={styles.result}>
                <span className="label">{L('Resultado', 'Result')}</span>
                {result ? (
                  <>
                    <Mini p={result.result} />
                    {result.kind === 'special' && <span className="tag tag--special">{L('Fusión especial', 'Special fusion')}</span>}
                    {result.kind === 'same-arcana' && <span className={styles.hint}>{L('Misma Arcana: el resultado baja de nivel.', 'Same Arcana: the result goes down in level.')}</span>}
                  </>
                ) : (
                  <p className="pending">{L('Esta combinación no da ninguna Persona.', "This combination doesn't produce a Persona.")}</p>
                )}
              </div>
            )}
            {a && !b && (
              <section className={styles.listBox}>
                <h2 className={styles.h2}>{L(`Todo lo que podés hacer con ${personaName(a)}`, `Everything you can make with ${personaName(a)}`)}</h2>
                <ul className={styles.rows}>
                  {withA.map(({ x, r }) => (
                    <li key={x.id}>
                      <span>+ <Link to={`?a=${a.id}&b=${x.id}`}>{personaName(x)}</Link> <small>{L('Nv', 'Lv')} {x.level}</small></span>
                      <span>= <Link to={`/p3r/calculadora/persona/${r.result.id}`}><strong>{personaName(r.result)}</strong></Link> <small>{getArcana(r.result.arcana).name} · {L('Nv', 'Lv')} {r.result.level}</small></span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <>
            <div className={styles.pickers}>
              <PersonaPicker id="pt" label={L('Quiero conseguir…', 'I want to get…')} list={list} value={target?.id ?? ''} onChange={(v) => setParam('p', v)} className={styles.select} />
              <label style={{ display: 'grid', gap: 6 }}>
                <span className="label label-accent">{L('Nivel máximo de los ingredientes', 'Max ingredient level')}</span>
                <input type="number" min={1} max={99} value={maxLv} onChange={(e) => setMaxLv(Math.min(99, Math.max(1, Number(e.target.value) || 1)))} className={styles.select} />
              </label>
            </div>
            {target && special && (
              <div className={styles.result}>
                <span className="label">{L('Fusión especial', 'Special fusion')}</span>
                <div className={styles.specialRow}>{special.map((s) => <Mini key={s.id} p={s} />)}</div>
              </div>
            )}
            {target && !special && (
              <section className={styles.listBox}>
                <h2 className={styles.h2}>{L(`${recipes.length} combinaciones para ${personaName(target)}`, `${recipes.length} combinations for ${personaName(target)}`)}</h2>
                <ul className={styles.rows}>
                  {recipes.map((r) => (
                    <li key={r.a.id + r.b.id}>
                      <span><Link to={`/p3r/calculadora/persona/${r.a.id}`}>{personaName(r.a)}</Link> <small>{getArcana(r.a.arcana).name} · {L('Nv', 'Lv')} {r.a.level}</small></span>
                      <span>+ <Link to={`/p3r/calculadora/persona/${r.b.id}`}>{personaName(r.b)}</Link> <small>{getArcana(r.b.arcana).name} · {L('Nv', 'Lv')} {r.b.level}</small></span>
                    </li>
                  ))}
                </ul>
                {!recipes.length && <p className="pending">{L('No hay combinaciones con ese nivel máximo.', 'No combinations with that max level.')}</p>}
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
