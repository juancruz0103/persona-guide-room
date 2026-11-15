import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { personaImage } from '../services/images';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { CalculatorHeader } from '../components/CalculatorHeader';
import { PersonaSelect } from '../components/PersonaSelect';
import { getArcana } from '../data/arcana';
import { KIND_LABEL, getFusionEngine, sortRecipes, type RecipeSort, type RecipeSortKey } from '../services/fusion';
import type { Persona } from '../types';
import styles from './Fusion.module.css';
import { personaName } from '../services/gameText';
import { L } from '../../../i18n';

const PAGE = 40;

function personaLabel(p: Persona) {
  return `${getArcana(p.arcana).name} · ${L('Nv', 'Lv')} ${p.level}`;
}

export default function Fusion() {
  const [params, setParams] = useSearchParams();
  const [includeDlc, setIncludeDlc] = useState(true);
  const [includeTreasure, setIncludeTreasure] = useState(true);
  const engine = useMemo(() => getFusionEngine({ includeDlc, includeTreasure }), [includeDlc, includeTreasure]);
  const options = engine.ingredients();

  const [a, setA] = useState(params.get('a') ?? 'pixie');
  const [b, setB] = useState(params.get('b') ?? 'arsene');
  const target = params.get('persona') ?? '';
  const [shown, setShown] = useState(PAGE);
  const [sort, setSort] = useState<RecipeSort | null>(null);
  const reverseRef = useRef<HTMLElement>(null);

  // Si una opción desactivada deja afuera a la Persona elegida, se limpia la selección.
  useEffect(() => {
    if (a && !options.some((p) => p.id === a)) setA('');
    if (b && !options.some((p) => p.id === b)) setB('');
  }, [options, a, b]);

  useEffect(() => {
    if (params.get('modo') === 'inversa') {
      reverseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [params]);

  useEffect(() => setShown(PAGE), [target, includeDlc, includeTreasure]);

  const pa = a ? engine.getById(a) : undefined;
  const pb = b ? engine.getById(b) : undefined;
  const result = pa && pb ? engine.fuse(pa, pb) : null;

  const targetP = target ? engine.getById(target) : undefined;
  const special = targetP ? engine.specialRecipe(targetP) : null;
  const recipes = useMemo(() => (targetP && !special ? engine.recipesFor(targetP) : []), [engine, targetP, special]);
  const sorted = useMemo(() => sortRecipes(recipes, sort), [recipes, sort]);

  // Cada clic: de menor a mayor → de mayor a menor → orden recomendado
  const toggleSort = (key: RecipeSortKey) =>
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));
  const sortHeader = (key: RecipeSortKey, label: string, hint: string) => {
    const active = sort?.key === key;
    return (
      <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className={`${styles.sortBtn} ${active ? styles.sortActive : ''}`} onClick={() => toggleSort(key)} title={hint}>
          {label}
          <span aria-hidden="true" className={styles.sortArrow}>{active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
        </button>
      </th>
    );
  };

  const setTarget = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('persona', id);
    else next.delete('persona');
    next.set('modo', 'inversa');
    setParams(next, { replace: true });
  };

  const slot = (n: 1 | 2, value: string, set: (v: string) => void, p?: Persona) => (
    <div className={styles.slot}>
      <label htmlFor={`p${n}`} className="label label-accent">Persona {n}</label>
      <PersonaSelect id={`p${n}`} value={value} options={options} onChange={set}
        className={styles.select} placeholder={L('Elegí una Persona', 'Choose a Persona')} />
      {p ? (
        <Link to={`/p5r/calculadora/persona/${p.id}`} className={styles.slotLink}>
          <ImagePlaceholder className={styles.slotImage} label={personaName(p)} hint={personaLabel(p)}
            src={personaImage(p.id, 'side')} focus="50% 30%"
            corner={getArcana(p.arcana).numeral} />
        </Link>
      ) : (
        <div className={`${styles.slotImage} ${styles.empty}`}>{L('Sin elegir', 'Not chosen')}</div>
      )}
    </div>
  );

  return (
    <>
      <CalculatorHeader />

      <section className={`container ${styles.fuse}`}>
        <div className={styles.options}>
          <label className={styles.check}>
            <input type="checkbox" checked={includeDlc} onChange={(e) => setIncludeDlc(e.target.checked)} />
            {L('Incluir Personas DLC', 'Include DLC Personas')}
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={includeTreasure} onChange={(e) => setIncludeTreasure(e.target.checked)} />
            {L('Incluir Treasure Demons', 'Include Treasure Demons')}
          </label>
        </div>

        <div className={styles.equation}>
          {slot(1, a, setA, pa)}
          <span className={styles.op} aria-hidden="true">+</span>
          {slot(2, b, setB, pb)}
          <span className={`${styles.op} ${styles.eq}`} aria-hidden="true">=</span>
          <div className={styles.slot}>
            <span className="label label-accent">{L('Resultado', 'Result')}</span>
            <div role="status" aria-live="polite">
              {result ? (
                <Link to={`/p5r/calculadora/persona/${result.result.id}`} className={styles.resultCard}>
                  <ImagePlaceholder className={styles.resultImage} label={personaName(result.result)}
                    src={personaImage(result.result.id, 'side')} focus="50% 15%"
                    corner={getArcana(result.result.arcana).numeral} />
                  <span className={styles.resultBody}>
                    <span className={styles.kind}>{KIND_LABEL[result.kind]}</span>
                    <span className={styles.resultName}>{personaName(result.result)}</span>
                    <span className={styles.resultMeta}>{personaLabel(result.result)}</span>
                    {result.unverified && (
                      <span className={styles.warn}>⚠ {L('Regla no verificada para este caso.', 'Rule not verified for this case.')}</span>
                    )}
                    <span className={styles.resultCta}>{L('Ver ficha →', 'See profile →')}</span>
                  </span>
                </Link>
              ) : (
                <div className={styles.result}>
                  <span className={styles.q}>?</span>
                  <span>
                    {pa && pb
                      ? pa.id === pb.id
                        ? L('No se puede fusionar una Persona consigo misma.', 'A Persona cannot be fused with itself.')
                        : L('Esta combinación no da ningún resultado.', 'This combination gives no result.')
                      : L('Elegí dos Personas para ver el resultado.', 'Choose two Personas to see the result.')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section ref={reverseRef} id="inversa" className={styles.reverse}>
        <div className="container">
          <SectionTitle size="md">{L('¿Cómo consigo una Persona?', 'How do I get a Persona?')}</SectionTitle>
          <div className={styles.search}>
            <label htmlFor="target" className="label label-accent">{L('Persona que querés obtener', 'Persona you want to get')}</label>
            <PersonaSelect id="target" value={target} options={options.filter((p) => !p.flags.treasure)}
              onChange={setTarget} className={styles.select} placeholder={L('Elegí una Persona', 'Choose a Persona')} />
          </div>

          {targetP && special && (
            <div className={styles.special}>
              <span className="tag tag--special">{L('Fusión especial', 'Special fusion')}</span>
              <p>
                <strong>{personaName(targetP)}</strong> {L('no sale por fusión normal. Se obtiene fusionando a la vez:', 'does not come from normal fusion. You get it by fusing at once:')}
              </p>
              <ul>
                {special.map((p) => (
                  <li key={p.id}>
                    <Link to={`/p5r/calculadora/persona/${p.id}`}>{personaName(p)}</Link>{' '}
                    <span>{personaLabel(p)}</span>
                  </li>
                ))}
              </ul>
              {special.length > 2 && (
                <p className={styles.note}>{L('Las fusiones de 3 o más Personas se hacen en el juego desde el menú de fusión avanzada.', 'Fusions of 3 or more Personas are done in the game from the advanced fusion menu.')}</p>
              )}
            </div>
          )}

          {targetP && !special && (
            <>
              <p className={styles.count}>
                {recipes.length
                  ? <><strong>{recipes.length}</strong> {L('combinaciones dan', 'combinations give')} {personaName(targetP)}. {sort ? L('Tocá el mismo título de nuevo para cambiar el orden o volver al recomendado.', 'Tap the same header again to change the order or go back to the recommended one.') : L('Primero las normales, después las que usan Treasure Demons; cada grupo de menor a mayor nivel. Tocá un título para ordenar.', 'Normal ones first, then the ones using Treasure Demons; each group from lowest to highest level. Tap a header to sort.')}</>
                  : <>{L('Ninguna combinación de 2 Personas da', 'No 2-Persona combination gives')} {personaName(targetP)} {L('con las opciones actuales.', 'with the current options.')}</>}
              </p>
              {recipes.length > 0 && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        {sortHeader('a', L('Ingrediente 1', 'Ingredient 1'), L('Ordenar por nombre (A-Z)', 'Sort by name (A-Z)'))}
                        {sortHeader('b', L('Ingrediente 2', 'Ingredient 2'), L('Ordenar por nombre (A-Z)', 'Sort by name (A-Z)'))}
                        {sortHeader('levels', L('Niveles', 'Levels'), L('Ordenar por nivel (de menor a mayor)', 'Sort by level (low to high)'))}
                        <th scope="col">{L('Tipo', 'Type')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.slice(0, shown).map((r) => (
                        <tr key={`${r.a.id}-${r.b.id}`}>
                          <td><Link to={`/p5r/calculadora/persona/${r.a.id}`}>{personaName(r.a)}</Link> <small>{getArcana(r.a.arcana).name}</small></td>
                          <td><Link to={`/p5r/calculadora/persona/${r.b.id}`}>{personaName(r.b)}</Link> <small>{getArcana(r.b.arcana).name}</small></td>
                          <td>{r.a.level} + {r.b.level}</td>
                          <td>{KIND_LABEL[r.kind]}{r.unverified ? ' ⚠' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {recipes.some((r) => r.unverified) && (
                <p className={styles.note}>
                  ⚠ {L('Treasure Demon + Persona de fusión especial: la regla para este caso no está verificada, tomalo con cuidado.', 'Treasure Demon + special fusion Persona: the rule for this case is not verified, take it with care.')}
                </p>
              )}
              {recipes.length > shown && (
                <button type="button" className={`btn btn--light ${styles.more}`} onClick={() => setShown((s) => s + PAGE)}>
                  {L('Ver', 'Show')} {Math.min(PAGE, recipes.length - shown)} {L('más', 'more')}
                </button>
              )}
            </>
          )}

          {!targetP && <p className={styles.count}>{L('Elegí una Persona para ver todas las combinaciones que la producen.', 'Choose a Persona to see every combination that produces it.')}</p>}
        </div>
      </section>
    </>
  );
}
