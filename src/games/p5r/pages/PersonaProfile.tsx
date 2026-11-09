import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFusionEngine } from '../services/fusion';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { AffinityGrid } from '../components/AffinityGrid';
import { ElectricChair } from '../components/ElectricChair';
import { SkillList } from '../components/SkillList';
import { getArcana } from '../data/arcana';
import { ELEMENTS } from '../data/elements';
import { getPersona } from '../services/personas';
import type { Persona } from '../types';
import styles from './PersonaProfile.module.css';

const STAT_LABELS: [keyof NonNullable<Persona['stats']>, string][] = [
  ['st', 'FU'], ['ma', 'MA'], ['en', 'RE'], ['ag', 'AG'], ['lu', 'SU'],
];

function unlockText(p: Persona): string {
  const u = p.unlock;
  if (!u) return 'Ninguna: se obtiene por fusión normal.';
  switch (u.type) {
    case 'confidant':
      return `Confidente de ${getArcana(u.arcana).name} al rango ${u.rank}.`;
    case 'dlc':
      return `Contenido descargable: ${u.pack}.`;
    case 'story':
    case 'treasure':
      return u.detail;
  }
}

/** Recetas para obtener la Persona (calculadas con DLC y tesoros activados). */
function FusionBox({ persona: p }: { persona: Persona }) {
  const engine = getFusionEngine({ includeDlc: true, includeTreasure: true });
  const special = engine.specialRecipe(p);
  const recipes = useMemo(
    () => (special || p.flags.treasure ? [] : engine.recipesFor(p)),
    [engine, p, special],
  );
  const reverseLink = `/p5r/calculadora/fusionar?modo=inversa&persona=${p.id}`;

  if (p.flags.treasure) {
    return (
      <div className={styles.card}>
        <span className="label label-accent">Treasure Demon</span>
        <span className={styles.muted}>
          No se obtiene por fusión: se recluta en el Metaverso. Sirve como ingrediente para subir o bajar de
          escalón a otras Personas.
        </span>
      </div>
    );
  }

  if (special) {
    return (
      <div className={styles.card}>
        <span className="label label-accent">Fusión especial</span>
        <ul className={styles.recipeList}>
          {special.map((s) => (
            <li key={s.id}>
              <Link to={`/p5r/calculadora/persona/${s.id}`}>{s.name}</Link>
              <small>{getArcana(s.arcana).name} · Nv {s.level}</small>
            </li>
          ))}
        </ul>
        <span className={styles.muted}>
          Ingredientes fijos{special.length > 2 ? ', todos a la vez (fusión avanzada)' : ''}: no sale por fusión
          normal.
        </span>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <span className="label label-accent">Recetas para obtenerla</span>
      {recipes.length ? (
        <>
          <span className={styles.muted}>
            <strong className={styles.countNum}>{recipes.length}</strong> combinaciones. Las de menor nivel:
          </span>
          <ul className={styles.recipeList}>
            {recipes.slice(0, 5).map((r) => (
              <li key={`${r.a.id}-${r.b.id}`}>
                <Link to={`/p5r/calculadora/persona/${r.a.id}`}>{r.a.name}</Link>
                {' + '}
                <Link to={`/p5r/calculadora/persona/${r.b.id}`}>{r.b.name}</Link>
                <small>Nv {r.a.level} + {r.b.level}</small>
              </li>
            ))}
          </ul>
          <Link to={reverseLink} className="label">Ver todas en la calculadora →</Link>
        </>
      ) : (
        <span className={styles.muted}>Ninguna combinación de 2 Personas la produce.</span>
      )}
    </div>
  );
}

export default function PersonaProfile() {
  const { personaId = '' } = useParams();
  const p = getPersona(personaId);

  if (!p) {
    return (
      <section className="container" style={{ paddingBlock: 80 }}>
        <p className="pending">No encontramos esa Persona.</p>
        <Link to="/p5r/calculadora">← Volver al catálogo</Link>
      </section>
    );
  }

  const arcana = getArcana(p.arcana);

  return (
    <article>
      <div className={`container ${styles.back}`}>
        <Link to="/p5r/calculadora" className="label">← Volver al catálogo</Link>
      </div>

      <section className={`container ${styles.top}`}>
        <ImagePlaceholder
          className={styles.image}
          label="Acá va la imagen de la Persona"
          hint="Formato sugerido: PNG transparente · 600 × 800"
          corner={arcana.numeral}
        />

        <div className={styles.info}>
          <div className={styles.heading}>
            <span className={styles.arcanaTag}>
              {arcana.name} · Arcana {arcana.numeral}
            </span>
            <h1 className={styles.name}>{p.name}</h1>
            <div className={styles.flags}>
              {p.flags.dlc && <span className="tag tag--dlc">DLC</span>}
              {p.flags.special && <span className="tag tag--special">Fusión especial</span>}
              {p.flags.treasure && <span className="tag tag--dlc">Treasure Demon</span>}
            </div>
          </div>

          <dl className={styles.facts}>
            <div className={styles.fact} style={{ ['--b' as string]: 'var(--c-accent)' }}>
              <dt className="label">Nivel base</dt>
              <dd className={styles.big}>{p.level}</dd>
            </div>
            <div className={styles.fact} style={{ ['--b' as string]: 'var(--c-text)' }}>
              <dt className="label">Herencia</dt>
              <dd>{p.inheritance ? ELEMENTS[p.inheritance].name : '—'}</dd>
            </div>
            <div className={styles.fact} style={{ ['--b' as string]: 'var(--c-primary)' }}>
              <dt className="label">Rasgo</dt>
              <dd>{p.trait ?? '—'}</dd>
            </div>
          </dl>

          <div className={styles.stats}>
            <span className="label label-accent">Estadísticas base</span>
            {p.stats ? (
              STAT_LABELS.map(([k, label]) => (
                <div key={k} className={styles.statRow}>
                  <span className={styles.statKey}>{label}</span>
                  <span className={styles.statTrack}>
                    <span className={styles.statFill} style={{ width: `${(p.stats![k] / 99) * 100}%` }} />
                  </span>
                  <span className={styles.statVal}>{p.stats![k]}</span>
                </div>
              ))
            ) : (
              <p className={styles.pendingLine}>Se cargan con el compendio completo (Etapa 3).</p>
            )}
          </div>
        </div>
      </section>

      <section className={`container ${styles.block}`}>
        <SectionTitle size="md">Afinidades elementales</SectionTitle>
        <AffinityGrid resistances={p.resistances} />
      </section>

      <section className={`container ${styles.bottom}`}>
        <div className={styles.skills}>
          <SectionTitle size="md">Habilidades</SectionTitle>
          {p.skills ? (
            <SkillList skills={p.skills} />
          ) : (
            <p className="pending">Las habilidades se cargan con el compendio completo (Etapa 3).</p>
          )}
          <p className={styles.techLink}>
            <Link to="/p5r/tecnicos">Ver la tabla completa de Técnicos →</Link>
          </p>
        </div>

        <aside className={styles.side}>
          <SectionTitle size="md">Fusión</SectionTitle>
          <FusionBox persona={p} />
          <SectionTitle size="md">Silla eléctrica</SectionTitle>
          <ElectricChair persona={p} />
          <div className={styles.card}>
            <span className="label label-accent">Condición de desbloqueo</span>
            <span className={styles.muted}>{unlockText(p)}</span>
          </div>
        </aside>
      </section>
    </article>
  );
}
