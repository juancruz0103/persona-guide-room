import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFusionEngine } from '../services/fusion';
import { BackButton } from '../../../shared/components/BackButton';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { personaImage, personaProfileFocus } from '../services/images';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { AffinityGrid } from '../components/AffinityGrid';
import { ElectricChair } from '../components/ElectricChair';
import { SkillList } from '../components/SkillList';
import { getArcana } from '../data/arcana';
import { ELEMENTS } from '../data/elements';
import { getPersona } from '../services/personas';
import type { Persona } from '../types';
import { TREASURE_TRAITS, traitDescription } from '../data/traits';
import styles from './PersonaProfile.module.css';
import { personaMyth, personaName, personaNameEn, skillName } from '../services/gameText';
import { PARTY_OWNER, PARTY_STAGE, isSpoilerStage } from '../data/party';
import { SpoilerCover } from '../components/SpoilerCover';
import { FavoriteButton } from '../components/FavoriteButton';
import { L, isEn, tr } from '../../../i18n';

const STAT_LABELS = (): [keyof NonNullable<Persona['stats']>, string][] =>
  isEn()
    ? [['st', 'St'], ['ma', 'Ma'], ['en', 'En'], ['ag', 'Ag'], ['lu', 'Lu']]
    : [['st', 'FU'], ['ma', 'MA'], ['en', 'RE'], ['ag', 'AG'], ['lu', 'SU']];

function unlockText(p: Persona): string {
  const u = p.unlock;
  if (!u) return L('Ninguna: se obtiene por fusión normal.', 'None: it is obtained through normal fusion.');
  switch (u.type) {
    case 'confidant':
      return L(`Confidente de ${getArcana(u.arcana).name} al rango ${u.rank}.`, `${getArcana(u.arcana).name} Confidant at rank ${u.rank}.`);
    case 'dlc':
      return `${L('Contenido descargable', 'Downloadable content')}: ${u.pack}.`;
    case 'story':
    case 'treasure':
      return tr(u.detail);
  }
}

function partyText(p: Persona): string {
  const owner = PARTY_OWNER[p.party!.owner];
  switch (p.party!.stage) {
    case 'initial':
      return L(`Es la Persona con la que despierta ${owner}.`, `It is the Persona ${owner} awakens with.`);
    case 'evolved':
      return p.party!.owner === 'akechi'
        ? L('Akechi la obtiene con la historia.', 'Akechi gets it through the story.')
        : L(`Evoluciona al llegar al rango 10 del confidente de ${owner}: gana una skill y cambian sus afinidades.`, `It evolves when ${owner}'s confidant reaches rank 10: it gains a skill and its affinities change.`);
    case 'third':
      return L('Despierta en el tercer semestre (solo Royal): gana una skill y un rasgo nuevo.', 'It awakens in the third semester (Royal only): it gains a skill and a new trait.');
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
          {L('No se obtiene por fusión: se recluta en el Metaverso. Sirve como ingrediente para subir o bajar de escalón a otras Personas.', 'It is not obtained through fusion: it is recruited in the Metaverse. It works as an ingredient to move other Personas up or down a rank.')}
        </span>
      </div>
    );
  }

  if (special) {
    return (
      <div className={styles.card}>
        <span className="label label-accent">{L('Fusión especial', 'Special fusion')}</span>
        <ul className={styles.recipeList}>
          {special.map((s) => (
            <li key={s.id}>
              <Link to={`/p5r/calculadora/persona/${s.id}`}>{personaName(s)}</Link>
              <small>{getArcana(s.arcana).name} · {L('Nv', 'Lv')} {s.level}</small>
            </li>
          ))}
        </ul>
        <span className={styles.muted}>
          {L('Ingredientes fijos', 'Fixed ingredients')}
          {special.length > 2 ? L(', todos a la vez (fusión avanzada)', ', all at once (advanced fusion)') : ''}
          {L(': no sale por fusión normal.', ': it does not come out of normal fusion.')}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <span className="label label-accent">{L('Recetas para obtenerla', 'Recipes to get it')}</span>
      {recipes.length ? (
        <>
          <span className={styles.muted}>
            <strong className={styles.countNum}>{recipes.length}</strong> {L('combinaciones. Las de menor nivel:', 'combinations. The lowest level ones:')}
          </span>
          <ul className={styles.recipeList}>
            {recipes.slice(0, 5).map((r) => (
              <li key={`${r.a.id}-${r.b.id}`}>
                <Link to={`/p5r/calculadora/persona/${r.a.id}`}>{personaName(r.a)}</Link>
                {' + '}
                <Link to={`/p5r/calculadora/persona/${r.b.id}`}>{personaName(r.b)}</Link>
                <small>{L('Nv', 'Lv')} {r.a.level} + {r.b.level}</small>
              </li>
            ))}
          </ul>
          <Link to={reverseLink} className="label">{L('Ver todas en la calculadora →', 'See all in the calculator →')}</Link>
        </>
      ) : (
        <span className={styles.muted}>{L('Ninguna combinación de 2 Personas la produce.', 'No 2-Persona combination produces it.')}</span>
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
        <p className="pending">{L('No encontramos esa Persona.', 'We could not find that Persona.')}</p>
        <Link to="/p5r/calculadora">{L('← Volver al catálogo', '← Back to catalog')}</Link>
      </section>
    );
  }

  const arcana = getArcana(p.arcana);

  return (
    <article>
      <div className={`container ${styles.back}`}>
        <BackButton fallback="/p5r/calculadora" />
      </div>

      <section className={`container ${styles.top}`}>
        <SpoilerCover active={isSpoilerStage(p.party?.stage)} className={styles.image}>
          <ImagePlaceholder
            className={styles.image}
            src={personaImage(p.id, 'profile')}
            focus={personaProfileFocus(p.id)}
            label={personaImage(p.id, 'profile') ? personaName(p) : L('Acá va la imagen de la Persona', 'Persona image goes here')}
            hint={L('Formato sugerido: PNG transparente · 600 × 800', 'Suggested format: transparent PNG · 600 × 800')}
            corner={arcana.numeral}
          />
        </SpoilerCover>

        <div className={styles.info}>
          <div className={styles.heading}>
            <span className={styles.arcanaTag}>
              {arcana.name} · Arcana {arcana.numeral}
            </span>
            <h1 className={styles.name}>{personaName(p)}</h1>
            <div className={styles.flags}>
              <FavoriteButton personaId={p.id} />
              {!p.party && (
                <Link to={`/p5r/builds?persona=${p.id}`} className="btn btn--light" style={{ minHeight: 42, fontSize: 17 }}>
                  {L('Ver builds', 'See builds')}
                </Link>
              )}
            </div>
            {personaNameEn(p) !== personaName(p) && <span className={styles.nameEn}>{L('En inglés', 'In Spanish')}: {personaNameEn(p)}</span>}
            <div className={styles.flags}>
              {p.flags.dlc && <span className="tag tag--dlc">DLC</span>}
              {p.flags.special && <span className="tag tag--special">{L('Fusión especial', 'Special fusion')}</span>}
              {p.flags.treasure && <span className="tag tag--dlc">Treasure Demon</span>}
              {p.party && <span className="tag tag--party">{PARTY_STAGE[p.party.stage]}</span>}
            </div>
            {p.party && (
              <p className={styles.partyNote}>
                {L('Persona de', 'Persona of')} <strong>{PARTY_OWNER[p.party.owner]}</strong>
                {L(': no se puede fusionar ni registrar en el compendio.', ': it cannot be fused or registered in the compendium.')}{' '}
                <Link to={`/p5r/confidentes/${p.party.owner}`}>{L('Ver su confidente →', 'See their confidant →')}</Link>
              </p>
            )}
          </div>

          <dl className={styles.facts}>
            {p.party ? (
              <div className={styles.fact} style={{ ['--b' as string]: 'var(--c-accent)' }}>
                <dt className="label">{L('Compañero', 'Party member')}</dt>
                <dd>{PARTY_OWNER[p.party.owner]}</dd>
              </div>
            ) : (
              <div className={styles.fact} style={{ ['--b' as string]: 'var(--c-accent)' }}>
                <dt className="label">{L('Nivel base', 'Base level')}</dt>
                <dd className={styles.big}>{p.level}</dd>
              </div>
            )}
            <div className={styles.fact} style={{ ['--b' as string]: 'var(--c-text)' }}>
              <dt className="label">{L('Herencia', 'Inheritance')}</dt>
              <dd>{p.inheritance ? ELEMENTS[p.inheritance].name : '—'}</dd>
            </div>
            <div className={styles.fact} style={{ ['--b' as string]: 'var(--c-primary)' }}>
              <dt className="label">{L('Rasgo', 'Trait')}</dt>
              <dd>{p.trait ? skillName(p.trait) : '—'}</dd>
            </div>
          </dl>

          {p.trait && traitDescription(p.trait) && (
            <div className={styles.trait}>
              <span className="label label-accent">{L('Rasgo', 'Trait')} · {skillName(p.trait)}</span>
              <p>{traitDescription(p.trait)}</p>
              {TREASURE_TRAITS[p.id] && (
                <ul className={styles.traitList}>
                  {TREASURE_TRAITS[p.id].map(([main, alt]) => (
                    <li key={main}>
                      <strong>{skillName(main)}</strong>: {traitDescription(main)}
                      {alt && <small> {L('Si ya lo tiene', 'If it already has it')}: {skillName(alt)}.</small>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className={styles.stats}>
            <span className="label label-accent">
              {p.party ? `${L('Estadísticas al unirse', 'Stats when joining')} (${L('Nv', 'Lv')} ${p.level})` : L('Estadísticas base', 'Base stats')}
            </span>
            {p.stats ? (
              STAT_LABELS().map(([k, label]) => (
                <div key={k} className={styles.statRow}>
                  <span className={styles.statKey}>{label}</span>
                  <span className={styles.statTrack}>
                    <span className={styles.statFill} style={{ width: `${(p.stats![k] / 99) * 100}%` }} />
                  </span>
                  <span className={styles.statVal}>{p.stats![k]}</span>
                </div>
              ))
            ) : (
              <p className={styles.pendingLine}>{L('Se cargan con el compendio completo (Etapa 3).', 'Loaded with the full compendium (Stage 3).')}</p>
            )}
          </div>
        </div>
      </section>

      <section className={`container ${styles.block}`}>
        <SectionTitle size="md">{L('Afinidades elementales', 'Elemental affinities')}</SectionTitle>
        <AffinityGrid resistances={p.resistances} />
      </section>

      <section className={`container ${styles.bottom}`}>
        <div className={styles.skills}>
          <SectionTitle size="md">{L('Habilidades', 'Skills')}</SectionTitle>
          {p.skills ? (
            <SkillList skills={p.skills} />
          ) : (
            <p className="pending">{L('Las habilidades se cargan con el compendio completo (Etapa 3).', 'Skills are loaded with the full compendium (Stage 3).')}</p>
          )}
          <p className={styles.techLink}>
            <Link to="/p5r/tecnicos">{L('Ver la tabla completa de Técnicos →', 'See the full Technical chart →')}</Link>
          </p>
          {personaMyth(p) && (
            <div className={styles.origin}>
              <SectionTitle size="md">{L('Origen', 'Origin')}</SectionTitle>
              <div className={styles.originCard}>
                <span className="label label-accent">{L('Mitología · texto oficial del juego', 'Mythology · official game text')}</span>
                <p>{personaMyth(p)}</p>
              </div>
            </div>
          )}
        </div>

        <aside className={styles.side}>
          {p.party ? (
            <>
              <SectionTitle size="md">{L('Cómo se obtiene', 'How to get it')}</SectionTitle>
              <div className={styles.card}>
                <span className="label label-accent">{PARTY_STAGE[p.party.stage]}</span>
                <span className={styles.muted}>{partyText(p)}</span>
              </div>
            </>
          ) : (
            <>
              <SectionTitle size="md">{L('Fusión', 'Fusion')}</SectionTitle>
              <FusionBox persona={p} />
              <SectionTitle size="md">{L('Silla eléctrica', 'Electric chair')}</SectionTitle>
              <ElectricChair persona={p} />
              <div className={styles.card}>
                <span className="label label-accent">{L('Condición de desbloqueo', 'Unlock condition')}</span>
                <span className={styles.muted}>{unlockText(p)}</span>
              </div>
            </>
          )}
        </aside>
      </section>
    </article>
  );
}
