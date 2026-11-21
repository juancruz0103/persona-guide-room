import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RecipeSortBar } from '../../../shared/components/RecipeSortBar';
import { sortRecipes, type RecipeSort } from '../../../shared/recipeSort';
import { useSessionState } from '../../../shared/hooks/useSessionState';
import { CalcHeader } from '../components/CalcHeader';
import { RecipeList } from '../components/RecipeList';
import { FusionNotes } from './PersonaProfile';
import { getFusionEngine } from '../fusion';
import { getAllPersonas, getPersona, personaName, TYPES, typeName } from '../services/personas';
import styles from '../../p4g/pages/PersonaProfile.module.css';
import catalog from '../../p5r/pages/Catalog.module.css';
import { L } from '../../../i18n';

/** «¿Cómo la consigo?»: las recetas de una Persona. */
export default function Fusion() {
  const [params, setParams] = useSearchParams();
  const [dlc, setDlc] = useSessionState('p5t.fusion.dlc', true);
  const pick = getPersona(params.get('p') ?? '');
  const engine = getFusionEngine(dlc);
  const choose = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('p', id); else next.delete('p');
    setParams(next, { replace: true });
  };
  const items = pick ? engine.recipesFor(pick).map((recipe) => ({ recipe })) : [];
  const [sort, setSort] = useState<RecipeSort | null>(null);
  const sorted = useMemo(
    () => sortRecipes(items, sort, ({ recipe }) => recipe.ingredients.length === 2
      ? [{ name: personaName(recipe.ingredients[0]), level: recipe.ingredients[0].level }, { name: personaName(recipe.ingredients[1]), level: recipe.ingredients[1].level }]
      : null),
    // items cambia de referencia en cada render: se recalcula con la Persona y el DLC elegidos
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pick?.id, dlc, sort],
  );

  return (
    <>
      <CalcHeader />
      <section className={`container ${styles.page}`}>
        <p className={styles.note}>
          {L('Elegí la Persona que querés crear y te mostramos todas las combinaciones que la dan.', 'Pick the Persona you want and we show every combination that gives it.')}
        </p>
        <label className={catalog.sort}>
          Persona
          <select className={catalog.input} value={pick?.id ?? ''} onChange={(e) => choose(e.target.value)}>
            <option value="">{L('Elegí una…', 'Pick one…')}</option>
            {TYPES.map((t) => (
              <optgroup key={t} label={typeName(t)}>
                {getAllPersonas().filter((p) => p.type === t).sort((x, y) => x.level - y.level)
                  .map((p) => <option key={p.id} value={p.id}>{personaName(p)} · {L('Nv', 'Lv')} {p.level}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className={catalog.check}>
          <input type="checkbox" checked={dlc} onChange={(e) => setDlc(e.target.checked)} />
          {L('Tengo el DLC de Pícaros y Raoul', 'I have the Picaro and Raoul DLC')}
        </label>
        {pick && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{L(`Cómo conseguir ${personaName(pick)}`, `How to get ${personaName(pick)}`)}</h2>
            <FusionNotes p={pick} />
            {items.length ? (
              <>
                {items.length > 1 && <RecipeSortBar sort={sort} onChange={setSort} />}
                <RecipeList items={sorted} />
              </>
            ) : (
              <p className={styles.note}>
                {!dlc && (pick.unlock === 'dlc' || pick.unlock === 'bonus')
                  ? L('Es de DLC: marcá la casilla de arriba si lo tenés.', 'It is DLC: tick the box above if you have it.')
                  : L('No sale de ninguna fusión.', "It doesn't come from any fusion.")}
              </p>
            )}
          </section>
        )}
      </section>
    </>
  );
}
