import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../fusion/engine';
import { isDlc, personaName, typeName } from '../services/personas';
import type { Persona } from '../types';
import styles from '../../p4g/pages/PersonaProfile.module.css';
import { L } from '../../../i18n';

export function PersonaLink({ p }: { p: Persona }) {
  return (
    <span>
      <Link to={`/p5t/calculadora/persona/${p.id}`}>{personaName(p)}</Link>
      <small> {L('Nv', 'Lv')} {p.level} · {typeName(p.type)}{isDlc(p) ? ' · DLC' : ''}</small>
    </span>
  );
}

const PAGE = 20;

/** Lista de recetas. `result` muestra el resultado al principio (vista «qué puedo crear»). Las listas largas se muestran de a 20. */
export function RecipeList({ items }: { items: { recipe: Recipe; result?: Persona }[] }) {
  const [shown, setShown] = useState(PAGE);
  return (
    <>
      <ul className={styles.recipes}>
        {items.slice(0, shown).map(({ recipe, result }, i) => (
          <li key={i}>
            {result && (
              <>
                <strong><PersonaLink p={result} /></strong>
                <em> = </em>
              </>
            )}
            {recipe.ingredients.map((p, j) => (
              <span key={p.id}>
                {j > 0 && <em> + </em>}
                <PersonaLink p={p} />
              </span>
            ))}
            {recipe.kind === 'special' && <small> · {L('Especial', 'Special')}</small>}
          </li>
        ))}
      </ul>
      {items.length > shown && (
        <button type="button" className="btn btn--light" onClick={() => setShown((n) => n + PAGE)}>
          {L(`Ver más (${items.length - shown} restantes)`, `Show more (${items.length - shown} left)`)}
        </button>
      )}
    </>
  );
}
