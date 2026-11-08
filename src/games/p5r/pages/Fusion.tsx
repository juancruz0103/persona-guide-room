import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { CalculatorHeader } from '../components/CalculatorHeader';
import { PersonaSelect } from '../components/PersonaSelect';
import { getArcana } from '../data/arcana';
import { KIND_LABEL, getFusionEngine } from '../services/fusion';
import type { Persona } from '../types';
import styles from './Fusion.module.css';

const PAGE = 40;

function personaLabel(p: Persona) {
  return `${getArcana(p.arcana).name} · Nv ${p.level}`;
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
        className={styles.select} placeholder="Elegí una Persona" />
      {p ? (
        <Link to={`/p5r/calculadora/persona/${p.id}`} className={styles.slotLink}>
          <ImagePlaceholder className={styles.slotImage} label={p.name} hint={personaLabel(p)}
            corner={getArcana(p.arcana).numeral} />
        </Link>
      ) : (
        <div className={`${styles.slotImage} ${styles.empty}`}>Sin elegir</div>
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
            Incluir Personas DLC
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={includeTreasure} onChange={(e) => setIncludeTreasure(e.target.checked)} />
            Incluir Treasure Demons
          </label>
        </div>

        <div className={styles.equation}>
          {slot(1, a, setA, pa)}
          <span className={styles.op} aria-hidden="true">+</span>
          {slot(2, b, setB, pb)}
          <span className={`${styles.op} ${styles.eq}`} aria-hidden="true">=</span>
          <div className={styles.slot}>
            <span className="label label-accent">Resultado</span>
            <div role="status" aria-live="polite">
              {result ? (
                <Link to={`/p5r/calculadora/persona/${result.result.id}`} className={styles.resultCard}>
                  <ImagePlaceholder className={styles.resultImage} label="Imagen de Persona"
                    corner={getArcana(result.result.arcana).numeral} />
                  <span className={styles.resultBody}>
                    <span className={styles.kind}>{KIND_LABEL[result.kind]}</span>
                    <span className={styles.resultName}>{result.result.name}</span>
                    <span className={styles.resultMeta}>{personaLabel(result.result)}</span>
                    {result.unverified && (
                      <span className={styles.warn}>⚠ Regla no verificada para este caso.</span>
                    )}
                    <span className={styles.resultCta}>Ver ficha →</span>
                  </span>
                </Link>
              ) : (
                <div className={styles.result}>
                  <span className={styles.q}>?</span>
                  <span>
                    {pa && pb
                      ? pa.id === pb.id
                        ? 'No se puede fusionar una Persona consigo misma.'
                        : 'Esta combinación no da ningún resultado.'
                      : 'Elegí dos Personas para ver el resultado.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section ref={reverseRef} id="inversa" className={styles.reverse}>
        <div className="container">
          <SectionTitle size="md">¿Cómo consigo una Persona?</SectionTitle>
          <div className={styles.search}>
            <label htmlFor="target" className="label label-accent">Persona que querés obtener</label>
            <PersonaSelect id="target" value={target} options={options.filter((p) => !p.flags.treasure)}
              onChange={setTarget} className={styles.select} placeholder="Elegí una Persona" />
          </div>

          {targetP && special && (
            <div className={styles.special}>
              <span className="tag tag--special">Fusión especial</span>
              <p>
                <strong>{targetP.name}</strong> no sale por fusión normal. Se obtiene fusionando a la vez:
              </p>
              <ul>
                {special.map((p) => (
                  <li key={p.id}>
                    <Link to={`/p5r/calculadora/persona/${p.id}`}>{p.name}</Link>{' '}
                    <span>{personaLabel(p)}</span>
                  </li>
                ))}
              </ul>
              {special.length > 2 && (
                <p className={styles.note}>Las fusiones de 3 o más Personas se hacen en el juego desde el menú de fusión avanzada.</p>
              )}
            </div>
          )}

          {targetP && !special && (
            <>
              <p className={styles.count}>
                {recipes.length
                  ? <><strong>{recipes.length}</strong> combinaciones dan {targetP.name}. Primero las normales, después las que usan Treasure Demons; cada grupo de menor a mayor nivel.</>
                  : <>Ninguna combinación de 2 Personas da {targetP.name} con las opciones actuales.</>}
              </p>
              {recipes.length > 0 && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">Ingrediente 1</th>
                        <th scope="col">Ingrediente 2</th>
                        <th scope="col">Niveles</th>
                        <th scope="col">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.slice(0, shown).map((r) => (
                        <tr key={`${r.a.id}-${r.b.id}`}>
                          <td><Link to={`/p5r/calculadora/persona/${r.a.id}`}>{r.a.name}</Link> <small>{getArcana(r.a.arcana).name}</small></td>
                          <td><Link to={`/p5r/calculadora/persona/${r.b.id}`}>{r.b.name}</Link> <small>{getArcana(r.b.arcana).name}</small></td>
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
                  ⚠ Treasure Demon + Persona de fusión especial: la regla para este caso no está verificada, tomalo con
                  cuidado.
                </p>
              )}
              {recipes.length > shown && (
                <button type="button" className={`btn btn--light ${styles.more}`} onClick={() => setShown((s) => s + PAGE)}>
                  Ver {Math.min(PAGE, recipes.length - shown)} más
                </button>
              )}
            </>
          )}

          {!targetP && <p className={styles.count}>Elegí una Persona para ver todas las combinaciones que la producen.</p>}
        </div>
      </section>
    </>
  );
}
