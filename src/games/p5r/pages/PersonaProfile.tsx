import { Link, useParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { AffinityGrid } from '../components/AffinityGrid';
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
          {p.specialRecipe ? (
            <div className={styles.card}>
              <span className="label label-accent">Fusión especial</span>
              <span className={styles.recipe}>{p.specialRecipe.join(' + ')}</span>
              <span className={styles.muted}>Ingredientes fijos: no sale por fusión normal.</span>
            </div>
          ) : (
            <div className={`${styles.card} ${styles.dashed}`}>
              <span className="label label-accent">Recetas para obtenerla</span>
              <span className={styles.muted}>
                Acá se van a listar los pares de Personas que dan {p.name}. Los calcula el motor de fusiones
                en la Etapa 3.
              </span>
              <Link to="/p5r/calculadora/fusionar?modo=inversa" className="label">Ver en la calculadora →</Link>
            </div>
          )}
          <div className={styles.card}>
            <span className="label label-accent">Itemización</span>
            <span className={styles.value}>{p.itemization ?? 'Pendiente (Etapa 3)'}</span>
          </div>
          <div className={styles.card}>
            <span className="label label-accent">Condición de desbloqueo</span>
            <span className={styles.muted}>{unlockText(p)}</span>
          </div>
        </aside>
      </section>
    </article>
  );
}
