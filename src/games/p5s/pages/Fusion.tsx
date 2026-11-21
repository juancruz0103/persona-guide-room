import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RecipeSortBar } from '../../../shared/components/RecipeSortBar';
import { sortRecipes, type RecipeSort } from '../../../shared/recipeSort';
import { CalcHeader } from '../components/CalcHeader';
import { RecipeList } from '../components/RecipeList';
import { ARCANAS } from '../data/arcana';
import { getFusionEngine } from '../fusion';
import { getAllPersonas, getPersona, personaName } from '../services/personas';
import styles from '../../p4g/pages/PersonaProfile.module.css';
import catalog from '../../p5r/pages/Catalog.module.css';
import { L } from '../../../i18n';

/** «¿Cómo la consigo?»: las recetas de una Persona. En Strikers el juego ya lista qué podés crear, así que no hace falta el modo inverso. */
export default function Fusion() {
  const [params, setParams] = useSearchParams();
  const reverse = true;
  const pick = getPersona(params.get('p') ?? '');
  const engine = getFusionEngine();
  const options = getAllPersonas().filter((p) => !p.party || !reverse);
  const choose = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('p', id); else next.delete('p');
    setParams(next, { replace: true });
  };
  const items = !pick
    ? []
    : reverse
      ? engine.recipesFor(pick).map((recipe) => ({ recipe }))
      : engine.fusionsWith(pick).map(({ recipe, result }) => ({ recipe, result }));
  const [sort, setSort] = useState<RecipeSort | null>(null);
  const sorted = useMemo(
    () => sortRecipes(items, sort, ({ recipe }) => recipe.ingredients.length === 2
      ? [{ name: personaName(recipe.ingredients[0].persona), level: recipe.ingredients[0].persona.level }, { name: personaName(recipe.ingredients[1].persona), level: recipe.ingredients[1].persona.level }]
      : null),
    // items cambia de referencia en cada render: se recalcula con la Persona elegida
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pick?.id, sort],
  );

  return (
    <>
      <CalcHeader />
      <section className={`container ${styles.page}`}>
        <p className={styles.note}>
          {reverse
            ? L('Elegí la Persona que querés crear y te mostramos con qué se hace. Cada ingrediente se puede cambiar por otra Persona de la misma Arcana que tenga ese nivel o más.', 'Pick the Persona you want and we show what it takes. Each ingredient can be swapped for another Persona of the same Arcana at that level or higher.')
            : L('Elegí una Persona que tengas y te mostramos todo lo que podés crear con ella.', 'Pick a Persona you have and we show everything you can create with it.')}
        </p>
        <label className={catalog.sort}>
          Persona
          <select className={catalog.input} value={pick?.id ?? ''} onChange={(e) => choose(e.target.value)}>
            <option value="">{L('Elegí una…', 'Pick one…')}</option>
            {ARCANAS.map((a) => {
              const list = options.filter((p) => p.arcana === a.id).sort((x, y) => x.level - y.level);
              return list.length ? (
                <optgroup key={a.id} label={a.name}>
                  {list.map((p) => <option key={p.id} value={p.id}>{personaName(p)} · {L('Nv', 'Lv')} {p.level}</option>)}
                </optgroup>
              ) : null;
            })}
          </select>
        </label>
        {pick && (
          <section className={styles.box}>
            <h2 className={styles.h2}>
              {reverse ? L(`Cómo conseguir ${personaName(pick)}`, `How to get ${personaName(pick)}`) : L(`Qué podés crear con ${personaName(pick)}`, `What you can create with ${personaName(pick)}`)}
            </h2>
            {items.length ? (
              <>
                {items.length > 1 && <RecipeSortBar sort={sort} onChange={setSort} />}
                <RecipeList items={sorted} />
              </>
            ) : (
              <p className={styles.note}>
                {reverse
                  ? pick.party ? L('Es de un compañero: no se fusiona.', "It belongs to a teammate: it can't be fused.") : L('No sale de ninguna fusión.', "It doesn't come from any fusion.")
                  : L('No es ingrediente de ninguna fusión.', "It isn't an ingredient in any fusion.")}
              </p>
            )}
          </section>
        )}
      </section>
    </>
  );
}
