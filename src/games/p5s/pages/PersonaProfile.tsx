import { useParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { BackButton } from '../../../shared/components/BackButton';
import { personaProfileFocus } from '../../p5r/services/images';
import { personaImage } from '../services/images';
import { AffinityGrid } from '../../p5r/components/AffinityGrid';
import { FavoriteButton } from '../../p5r/components/FavoriteButton';
import { CalcHeader } from '../components/CalcHeader';
import { SkillRow } from '../components/SkillRow';
import { RecipeList } from '../components/RecipeList';
import { getFusionEngine } from '../fusion';
import { getArcana } from '../data/arcana';
import { getPersona, PARTY_OWNER, personaName } from '../services/personas';
import styles from '../../p4g/pages/PersonaProfile.module.css';
import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import { PersonaLink } from '../components/RecipeList';
import { getPersona as byId } from '../services/personas';
import { L, isEn } from '../../../i18n';

const STATS = () => [['st', L('Fu', 'St')], ['ma', 'Ma'], ['en', L('Re', 'En')], ['ag', 'Ag'], ['lu', L('Su', 'Lu')]] as const;

/** Requisitos de la fuente traducidos. */
const PREREQ: Record<string, [string, string]> = {
  'Enemy Only': ['Solo aparece como enemigo: no se fusiona.', 'Enemy only: it cannot be fused.'],
  'New Game+': ['Solo en Nueva partida+.', 'New Game+ only.'],
};
const prereqText = (s: string) => {
  if (PREREQ[s]) return L(...PREREQ[s]);
  const jail = s.match(/Defeath? in (\w+) Jail/);
  if (jail) return L(`Se desbloquea al derrotarla en la Cárcel de ${jail[1] === 'Kyoto' ? 'Kioto' : jail[1]}.`, `Unlocked by defeating it in the ${jail[1]} Jail.`);
  return s;
};

export default function PersonaProfile() {
  const { personaId = '' } = useParams();
  const p = getPersona(personaId);
  if (!p)
    return (
      <>
        <CalcHeader />
        <p className="container pending">{L('No encontramos esa Persona.', "We couldn't find that Persona.")}</p>
      </>
    );
  const arcana = getArcana(p.arcana);
  const img = personaImage(p.id, 'profile');
  const max = Math.max(...Object.values(p.stats), 1);

  return (
    <>
      <CalcHeader />
      <article className={`container ${styles.page}`}>
        <div><BackButton fallback="/p5s/calculadora" label={L('Volver', 'Back')} /></div>
        <header className={styles.top}>
          <SpoilerCover active={!!p.spoiler} className={img ? styles.photoBig : styles.photo} label={L('Spoiler · tocá para ver', 'Spoiler · tap to see')}>
            <ImagePlaceholder className={img ? styles.photoBig : styles.photo} src={img} focus={personaProfileFocus(p.id)}
              label={img ? personaName(p) : L('Imagen de Persona', 'Persona image')} icon="person" />
          </SpoilerCover>
          <div>
            <span className={styles.kicker}>
              {arcana.name}{arcana.numeral && <> · Arcana {arcana.numeral}</>}
              {!p.party && <> · {L('Nv', 'Lv')} {p.level}</>}
            </span>
            <h1 className={styles.name}>{personaName(p)}</h1>
            {!isEn() && p.nameEs && p.nameEs !== p.nameEn && <span className={styles.alt}>{p.nameEn}</span>}
            <div className={styles.tags}>
              {p.party && <span className="tag tag--party">{L('Persona de', 'Persona of')} {PARTY_OWNER[p.party]}</span>}
              {p.special && <span className="tag tag--special">{L('Fusión especial', 'Special fusion')}</span>}
            </div>
            <div className={styles.actions}><FavoriteButton personaId={`p5s:${p.id}`} /></div>
          </div>
        </header>

        {(isEn() ? p.mythEn : p.mythEs) && <p className={styles.note}>{isEn() ? p.mythEn : p.mythEs}</p>}
        {p.id === 'pithos' && byId('pandora') && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Evolución', 'Evolution')}</h2>
            <SpoilerCover active label={L('Spoiler · tocá para ver en qué evoluciona', 'Spoiler · tap to see its evolution')}>
              <p className={styles.note}>{L('Más adelante en la historia despierta como', 'Later in the story it awakens as')} <PersonaLink p={byId('pandora')!} />.</p>
            </SpoilerCover>
          </section>
        )}
        {p.spoiler && <p className={styles.note}>{L('Despertar de Pithos. Contiene spoilers de la historia.', "Pithos's awakening. Contains story spoilers.")}</p>}

        <section aria-label={L('Afinidades', 'Affinities')}><AffinityGrid resistances={p.resistances} /></section>

        <div className={styles.cols}>
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Habilidades', 'Skills')}</h2>
            {p.id === 'pithos' && (
              <p className={styles.note}>{L('En el juego, sus habilidades aparecen entre signos de pregunta (por ejemplo, «¿Dia?»). Es solo un detalle visual: funcionan igual.', 'In the game its skills are shown between question marks (e.g. "Dia?"). It is only cosmetic: they work the same.')}</p>
            )}
            {p.skills.length ? (
              <ul className={styles.skills}>
                {p.skills.map((s) => (
                  <SkillRow key={s.skill} name={s.skill} right={s.note === 'event' ? L('Al despertar', 'On awakening') : s.level === null ? L('Inicial', 'Innate') : `${L('Nv', 'Lv')} ${s.level}`} />
                ))}
              </ul>
            ) : (
              <p className={styles.note}>{L('No aprende habilidades.', "It doesn't learn skills.")}</p>
            )}
          </section>

          <div className={styles.side}>
            <section className={styles.box}>
              <h2 className={styles.h2}>{L('Estadísticas', 'Stats')}</h2>
              {STATS().map(([k, label]) => (
                <div key={k} className={styles.stat}>
                  <span>{label}</span>
                  <i style={{ width: `${(p.stats[k] / max) * 100}%` }} />
                  <b>{p.stats[k]}</b>
                </div>
              ))}
            </section>
            {(p.location || p.prereq) && (
              <section className={styles.box}>
                <h2 className={styles.h2}>{L('Dónde conseguirla', 'Where to get it')}</h2>
                {p.location && <p className={styles.note}>{L('Aparece en', 'Appears in')}: <strong>{L(p.location.es, p.location.en)}</strong></p>}
                {p.prereq && <p className={styles.note}>{prereqText(p.prereq)}</p>}
              </section>
            )}
          </div>
        </div>
        {!p.party && p.prereq !== 'Enemy Only' && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{p.special ? L('Fusión especial', 'Special fusion') : L('Cómo conseguirla por fusión', 'How to fuse it')}</h2>
            {getFusionEngine().recipesFor(p).length ? (
              <>
                {p.special && <p className={styles.note}>{L('Cada ingrediente tiene que tener al menos el nivel indicado.', 'Each ingredient must be at least the level shown.')}</p>}
                <RecipeList items={getFusionEngine().recipesFor(p).map((recipe) => ({ recipe }))} />
              </>
            ) : (
              <p className={styles.note}>{L('No sale de ninguna fusión.', "It doesn't come from any fusion.")}</p>
            )}
          </section>
        )}
      </article>
    </>
  );
}
