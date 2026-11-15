import { Link, useParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { CalcHeader } from '../components/CalcHeader';
import { SkillRow } from '../components/SkillRow';
import { ElementIcon } from '../components/ElementIcon';
import { PersonaPeek } from '../components/PersonaPeek';
import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import { getArcana } from '../data/arcana';
import { affinityLong, affinityShort, elementColor, elementShort, elementName, RESIST_GROUPS, INHERIT_ELEMS } from '../data/elements';
import fusionJson from '../data/generated/fusion.json';
import { getFusionEngine } from '../fusion';
import { getPersona, PARTY_OWNER } from '../services/personas';
import { itemName, personaMyth, personaName } from '../services/text';
import { unlockText } from '../services/unlock';
import type { SkillElement } from '../types';
import styles from './PersonaProfile.module.css';
import { heartDescription } from './Hearts';
import { L } from '../../../i18n';

const INHERIT = (fusionJson as { inheritTypes: Record<string, string[]> }).inheritTypes;
const STATS = () => [
  ['st', L('Fu', 'St')], ['ma', 'Ma'], ['en', L('Re', 'En')], ['ag', 'Ag'], ['lu', L('Su', 'Lu')],
] as const;

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
  const engine = getFusionEngine({ includeDlc: true });
  const special = engine.specialRecipe(p);
  const recipes = p.party || special ? [] : engine.recipesFor(p);
  const myth = personaMyth(p);
  const canInherit = p.inheritance ? INHERIT[p.inheritance] ?? [] : [];
  const cantInherit = INHERIT_ELEMS.filter((e) => !canInherit.includes(e));
  const normal = p.skills.filter((s) => s.note !== 'special');
  const extra = p.skills.filter((s) => s.note === 'special');
  const max = Math.max(...Object.values(p.stats), 1);

  return (
    <>
      <CalcHeader />
      <article className={`container ${styles.page}`}>
        <Link to="/p3r/calculadora" className={styles.back}>← {L('Volver al catálogo', 'Back to catalog')}</Link>
        <header className={styles.top}>
          <ImagePlaceholder className={styles.photo} label={L('Imagen de Persona', 'Persona image')} icon="person" />
          <div>
            <span className={styles.kicker}>
              {arcana.name} · Arcana {arcana.numeral || '—'}
              {!p.party && <> · {L('Nv', 'Lv')} {p.level}</>}
            </span>
            <h1 className={styles.name}>{personaName(p)}</h1>
            {p.nameEs && p.nameEs !== p.name && <span className={styles.alt}>{L(p.name, p.nameEs)}</span>}
            <div className={styles.tags}>
              {p.party && <span className="tag tag--party">{L('Persona de', 'Persona of')} {PARTY_OWNER[p.party.owner ?? '']}</span>}
              {p.flags.dlc && <span className="tag tag--dlc">DLC</span>}
              {p.flags.special && <span className="tag tag--special">{L('Fusión especial', 'Special fusion')}</span>}
            </div>
          </div>
        </header>

        {p.party?.evolvedId && getPersona(p.party.evolvedId) && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Evolución', 'Evolution')}</h2>
            <SpoilerCover active label={L('Spoiler · tocá para ver en qué evoluciona', 'Spoiler · tap to see its evolution')}>
              <p className={styles.note}>
                {L('Evoluciona por la historia en', 'Evolves through the story into')} <PersonaPeek persona={getPersona(p.party.evolvedId)!} below />.
              </p>
            </SpoilerCover>
          </section>
        )}
        {p.party?.baseId && getPersona(p.party.baseId) && (
          <p className={styles.note}>
            {L('Evolución por historia de', 'Story evolution of')} <PersonaPeek persona={getPersona(p.party.baseId)!} below />. {L('Contiene spoilers.', 'Contains spoilers.')}
          </p>
        )}
        <section aria-label={L('Afinidades', 'Affinities')} className={styles.affWrap}>
          {RESIST_GROUPS.map((g) => (
            <div key={g.label()} className={styles.affGroup}>
              <span className={styles.groupLabel}>{g.label()}</span>
              <div className={styles.affRow}>
                {g.ids.map((id) => {
                  const a = p.resistances[id];
                  return (
                    <div key={id} className={styles.aff} style={{ borderTopColor: elementColor(id) }} title={`${elementName(id)}: ${affinityLong(a)}`}>
                      <ElementIcon el={id} size={34} title={false} />
                      <b>{elementShort(id)}</b>
                      <span className={styles[`a_${a}`]}>{affinityShort(a)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <div className={styles.cols}>
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Habilidades', 'Skills')}</h2>
            <ul className={styles.skills}>
              {normal.map((s) => (
                <SkillRow key={s.skill} name={s.skill} right={s.level === null ? L('Inicial', 'Innate') : `${L('Nv', 'Lv')} ${s.level}`} />
              ))}
            </ul>
            {extra.length > 0 && (
              <>
                <h3 className={styles.h3}>{L('Teúrgia y habilidades especiales', 'Theurgy and special skills')}</h3>
                <p className={styles.note}>
                  {p.party ? L('Las Teúrgias se cargan en combate. Las pasivas de dos niveles se consiguen pasando el rato con el compañero.', 'Theurgies charge up in battle. Two-level passives are earned by hanging out with the teammate.') : L('No se aprenden por nivel: la Teúrgia se carga en combate.', "Not learned by level: the Theurgy charges up in battle.")}
                </p>
                <ul className={styles.skills}>{extra.map((s) => <SkillRow key={s.skill} name={s.skill} />)}</ul>
              </>
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

            {p.heart && (
              <section className={`${styles.box} ${styles.heart}`}>
                <h2 className={styles.h2}>{L('Objeto de corazón', 'Heart item')}</h2>
                <p className={styles.big}>{itemName(p.heart.item)}</p>
                {heartDescription(p.heart.item) && <p className={styles.note}>{heartDescription(p.heart.item)}</p>}
                <p className={styles.note}>{L(`Lo da al llegar al Nv ${p.heart.level}.`, `Given at Lv ${p.heart.level}.`)}</p>
              </section>
            )}

            {!p.party && (
              <section className={styles.box}>
                <h2 className={styles.h2}>{L('Herencia', 'Inheritance')}</h2>
                {cantInherit.length ? (
                  <p className={styles.note}>
                    {L('No puede heredar:', "Can't inherit:")}{' '}
                    <span className={styles.inheritList}>
                      {cantInherit.map((e) => (
                        <span key={e}><ElementIcon el={e as SkillElement} size={22} title={false} />{elementName(e as SkillElement)}</span>
                      ))}
                    </span>
                  </p>
                ) : (
                  <p className={styles.note}>{L('Puede heredar habilidades de cualquier tipo.', 'Can inherit any skill type.')}</p>
                )}
              </section>
            )}

            {p.unlock && (
              <section className={styles.box}>
                <h2 className={styles.h2}>{L('Cómo desbloquearla', 'How to unlock it')}</h2>
                <p className={styles.note}>{unlockText(p.unlock)}</p>
              </section>
            )}
          </div>
        </div>

        {special && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Fusión especial', 'Special fusion')}</h2>
            <div className={styles.recipe}>
              {special.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && <em> + </em>}
                  <PersonaPeek persona={s} below />
                  <small> ({getArcana(s.arcana).name}, {L('Nv', 'Lv')} {s.level})</small>
                </span>
              ))}
            </div>
          </section>
        )}

        {!p.party && !special && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Cómo conseguirla por fusión', 'How to fuse it')}</h2>
            {recipes.length ? (
              <>
                <p className={styles.note}>{L(`${recipes.length} combinaciones. Primero las de menor nivel.`, `${recipes.length} combinations. Lowest level first.`)}</p>
                <ul className={styles.recipes}>
                  {recipes.slice(0, 12).map((r) => (
                    <li key={r.a.id + r.b.id}>
                      <PersonaPeek persona={r.a} below />
                      <small> {L('Nv', 'Lv')} {r.a.level}</small>
                      <em> + </em>
                      <PersonaPeek persona={r.b} below />
                      <small> {L('Nv', 'Lv')} {r.b.level}</small>
                    </li>
                  ))}
                </ul>
                {recipes.length > 12 && (
                  <Link className="btn btn--light" to={`/p3r/calculadora/fusionar?modo=inversa&p=${p.id}`}>{L('Ver todas →', 'See all →')}</Link>
                )}
              </>
            ) : (
              <p className={styles.note}>{L('No sale de ninguna fusión de 2 Personas.', "It doesn't come from any 2-Persona fusion.")}</p>
            )}
          </section>
        )}

        {myth && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Historia', 'Lore')}</h2>
            <p className={styles.myth}>{myth}</p>
          </section>
        )}
      </article>
    </>
  );
}
