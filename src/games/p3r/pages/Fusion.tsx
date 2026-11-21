import { useMemo, useState } from 'react';
import { RecipeSortBar } from '../../../shared/components/RecipeSortBar';
import { sortRecipes, type RecipeSort } from '../../../shared/recipeSort';
import { Link, useSearchParams } from 'react-router-dom';
import { CalcHeader } from '../components/CalcHeader';
import { PersonaPicker } from '../components/PersonaPicker';
import { PersonaPeek } from '../components/PersonaPeek';
import { getArcana } from '../data/arcana';
import { getFusionEngine } from '../fusion';
import { personaName } from '../services/text';
import type { Persona } from '../types';
import styles from './Fusion.module.css';
import royal from '../../p5r/pages/Fusion.module.css';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { personaCardFocus, personaImage } from '../services/images';
import { L } from '../../../i18n';

const KIND = () => ({
  normal: L('Fusión normal', 'Normal fusion'),
  'same-arcana': L('Misma Arcana', 'Same Arcana'),
  special: L('Fusión especial', 'Special fusion'),
}) as Record<string, string>;
const label = (p: Persona) => `${getArcana(p.arcana).name} · ${L('Nv', 'Lv')} ${p.level}`;

function Slot({ id, title, list, p, onChange }: { id: string; title: string; list: Persona[]; p?: Persona; onChange: (v: string) => void }) {
  return (
    <div className={royal.slot}>
      <PersonaPicker id={id} label={title} list={list} value={p?.id ?? ''} onChange={onChange} className={styles.select} />
      {p ? (
        <Link to={`/p3r/calculadora/persona/${p.id}`} className={royal.slotLink}>
          <ImagePlaceholder className={`${royal.slotImage}`} label={personaName(p)} hint={label(p)}
            src={personaImage(p.id, 'side')} focus={personaCardFocus(p.id)} corner={getArcana(p.arcana).numeral} />
        </Link>
      ) : (
        <div className={`${royal.slotImage} ${royal.empty}`}>{L('Sin elegir', 'Not chosen')}</div>
      )}
    </div>
  );
}

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
  const [sort, setSort] = useState<RecipeSort | null>(null);
  const sorted = useMemo(
    () => sortRecipes(recipes, sort, (r) => [{ name: personaName(r.a), level: r.a.level }, { name: personaName(r.b), level: r.b.level }]),
    [recipes, sort],
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
            <div className={royal.equation}>
              <Slot id="pa" title="Persona A" list={list} p={a} onChange={(v) => setParam('a', v)} />
              <span className={royal.op} aria-hidden="true">+</span>
              <Slot id="pb" title="Persona B" list={list} p={b} onChange={(v) => setParam('b', v)} />
              <span className={`${royal.op} ${royal.eq}`} aria-hidden="true">=</span>
              <div className={royal.slot}>
                <span className="label label-accent">{L('Resultado', 'Result')}</span>
                <div role="status" aria-live="polite">
                  {result ? (
                    <Link to={`/p3r/calculadora/persona/${result.result.id}`} className={royal.resultCard}>
                      <ImagePlaceholder className={`${royal.resultImage}`} label={personaName(result.result)}
                        src={personaImage(result.result.id, 'side')} focus={personaCardFocus(result.result.id)} corner={getArcana(result.result.arcana).numeral} />
                      <span className={royal.resultBody}>
                        <span className={royal.kind}>{KIND()[result.kind]}</span>
                        <span className={royal.resultName}>{personaName(result.result)}</span>
                        <span className={royal.resultMeta}>{label(result.result)}</span>
                        {result.kind === 'same-arcana' && <span className={royal.resultMeta}>{L('Misma Arcana: el resultado baja de nivel.', 'Same Arcana: the result goes down in level.')}</span>}
                        <span className={royal.resultCta}>{L('Ver ficha →', 'See profile →')}</span>
                      </span>
                    </Link>
                  ) : (
                    <div className={royal.result}>
                      <span className={royal.q}>?</span>
                      <span>
                        {a && b
                          ? a.id === b.id
                            ? L('No se puede fusionar una Persona consigo misma.', 'A Persona cannot be fused with itself.')
                            : L('Esta combinación no da ningún resultado.', 'This combination gives no result.')
                          : L('Elegí dos Personas para ver el resultado.', 'Choose two Personas to see the result.')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {a && !b && (
              <section className={styles.listBox}>
                <h2 className={styles.h2}>{L(`Todo lo que podés hacer con ${personaName(a)}`, `Everything you can make with ${personaName(a)}`)}</h2>
                <ul className={styles.rows}>
                  {withA.map(({ x, r }) => (
                    <li key={x.id}>
                      <span>+ <Link to={`?a=${a.id}&b=${x.id}`}>{personaName(x)}</Link> <small>{L('Nv', 'Lv')} {x.level}</small></span>
                      <span>= <strong><PersonaPeek persona={r.result} below /></strong> <small>{getArcana(r.result.arcana).name} · {L('Nv', 'Lv')} {r.result.level}</small></span>
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
                {recipes.length > 1 && <RecipeSortBar sort={sort} onChange={setSort} />}
                <ul className={styles.rows}>
                  {sorted.map((r) => (
                    <li key={r.a.id + r.b.id}>
                      <span><PersonaPeek persona={r.a} below /> <small>{getArcana(r.a.arcana).name} · {L('Nv', 'Lv')} {r.a.level}</small></span>
                      <span>+ <PersonaPeek persona={r.b} below /> <small>{getArcana(r.b.arcana).name} · {L('Nv', 'Lv')} {r.b.level}</small></span>
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
