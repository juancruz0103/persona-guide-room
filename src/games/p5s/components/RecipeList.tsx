import { Link } from 'react-router-dom';
import type { Recipe } from '../fusion/engine';
import { personaName } from '../services/personas';
import { getArcana } from '../data/arcana';
import type { Persona } from '../types';
import styles from '../../p4g/pages/PersonaProfile.module.css';
import { L } from '../../../i18n';

const KIND = () => ({
  recipe: L('Receta', 'Recipe'),
  arcana: L('Misma Arcana', 'Same Arcana'),
  down: L('Misma Arcana', 'Same Arcana'),
  special: L('Especial', 'Special'),
});

export function PersonaLink({ p, min }: { p: Persona; min?: number }) {
  return (
    <span>
      <Link to={`/p5s/calculadora/persona/${p.id}`}>{personaName(p)}</Link>
      <small> {L('Nv', 'Lv')} {min ? `${min}+` : p.level}</small>
    </span>
  );
}

/** Lista de recetas: cada una con sus ingredientes y su tipo. `result` muestra el resultado al principio (vista «qué puedo crear»). */
export function RecipeList({ items }: { items: { recipe: Recipe; result?: Persona }[] }) {
  return (
    <ul className={styles.recipes}>
      {items.map(({ recipe, result }, i) => (
        <li key={i}>
          {result && (
            <>
              <strong><PersonaLink p={result} /></strong>
              <em> = </em>
            </>
          )}
          {recipe.ingredients.map((ing, j) => (
            <span key={ing.persona.id}>
              {j > 0 && <em> + </em>}
              <PersonaLink p={ing.persona} min={ing.anyOfArcana ? undefined : ing.minLevel} />
              {ing.anyOfArcana && <small title={L('Sirve cualquier Persona de esa Arcana con ese nivel o más', 'Any Persona of that Arcana at that level or higher works')}> ({getArcana(ing.persona.arcana).name})</small>}
            </span>
          ))}
          <small> · {KIND()[recipe.kind]}</small>
          {recipe.ingredients.some((i) => i.anyOfArcana) && (
            <small style={{ display: 'block' }}>{L('Cada una se puede cambiar por otra de la misma Arcana con ese nivel o más.', 'Each can be swapped for another of the same Arcana at that level or higher.')}</small>
          )}
        </li>
      ))}
    </ul>
  );
}
