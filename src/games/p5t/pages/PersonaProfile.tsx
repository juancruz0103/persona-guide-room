import { useParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { BackButton } from '../../../shared/components/BackButton';
import { CalcHeader } from '../components/CalcHeader';
import { RecipeList } from '../components/RecipeList';
import { getFusionEngine } from '../fusion';
import { personaImage } from '../services/images';
import { getPersona, isDlc, personaName, skillDescription, skillName, statsAt, typeName } from '../services/personas';
import type { Persona, PersonaSkill } from '../types';
import styles from '../../p4g/pages/PersonaProfile.module.css';
import art from '../components/Art.module.css';
import { L, isEn } from '../../../i18n';

const STATS = () => [['hp', L('PV', 'HP')], ['sp', L('PE', 'SP')], ['melee', L('Cuerpo a cuerpo', 'Melee')], ['gun', L('Disparo', 'Gun')]] as const;

/** Avisos sobre cómo se habilita la Persona o su fusión. */
export function FusionNotes({ p }: { p: Persona }) {
  const notes: string[] = [];
  if (p.unlock === 'dlc') notes.push(L('Viene con el DLC «Picaro Summoning Pack & Raoul».', 'Comes with the "Picaro Summoning Pack & Raoul" DLC.'));
  if (p.unlock === 'bonus') notes.push(L('Contenido descargable de bonificación.', 'Bonus downloadable content.'));
  if (p.unlock === 'quest') notes.push(L('Se habilita para fusionar al completar una misión.', 'Unlocked for fusion by completing a quest.'));
  if (p.unlock === 'legacy') notes.push(L('Persona invitada de otros juegos de la saga.', 'Guest Persona from other games in the series.'));
  if (p.specialLocked) notes.push(L('Esta fusión especial hay que habilitarla antes en el juego.', 'This special fusion has to be unlocked in the game first.'));
  if (!p.normalFusion && !p.special) notes.push(L('Solo sale por fusión especial.', 'Only available through special fusion.'));
  return notes.length ? <>{notes.map((n) => <p key={n} className={styles.note}>{n}</p>)}</> : null;
}

function SkillBox({ title, s }: { title: string; s: PersonaSkill }) {
  return (
    <div style={{ borderLeft: '4px solid var(--c-primary)', paddingLeft: 12, marginBottom: 12 }}>
      <span className={styles.kicker} style={{ fontSize: 12 }}>{title}</span>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{skillName(s)}</div>
      <p className={styles.note} style={{ margin: '4px 0 0' }}>{skillDescription(s)}</p>
    </div>
  );
}

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
  const img = personaImage(p.id);
  const base = statsAt(p, p.level);
  const max = statsAt(p, 99);
  const top = Math.max(max.hp, max.sp, 1);
  const recipes = getFusionEngine().recipesFor(p);

  return (
    <>
      <CalcHeader />
      <article className={`container ${styles.page}`}>
        <div><BackButton fallback="/p5t/calculadora" label={L('Volver', 'Back')} /></div>
        <header className={styles.top}>
          <ImagePlaceholder className={`${img ? styles.photoBig : styles.photo} ${art.art}`} src={img}
            label={img ? personaName(p) : L('Imagen de Persona', 'Persona image')} icon="person" />
          <div>
            <span className={styles.kicker}>{typeName(p.type)} · {L('Nv', 'Lv')} {p.level}</span>
            <h1 className={styles.name}>{personaName(p)}</h1>
            {!isEn() && p.nameEs !== p.nameEn && <span className={styles.alt}>{p.nameEn}</span>}
            <div className={styles.tags}>
              <span className={`tag ${art.type}`}>{typeName(p.type)}</span>
              {p.special && <span className="tag tag--special">{L('Fusión especial', 'Special fusion')}</span>}
              {isDlc(p) && <span className="tag tag--party">DLC</span>}
            </div>
          </div>
        </header>

        {(isEn() ? p.mythEn : p.mythEs) && <p className={styles.note}>{isEn() ? p.mythEn : p.mythEs}</p>}

        <div className={styles.cols}>
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Habilidades', 'Skills')}</h2>
            {p.unique && <SkillBox title={L('Única', 'Unique')} s={p.unique} />}
            {p.inherited && <SkillBox title={L('Heredada (si la conseguís sin fusionar)', 'Inherited (if obtained without fusing)')} s={p.inherited} />}
            <p className={styles.note}>{L('Al fusionar, la Persona nueva hereda una habilidad de los ingredientes.', 'When fusing, the new Persona inherits one skill from the ingredients.')}</p>
          </section>
          <div className={styles.side}>
            <section className={styles.box}>
              <h2 className={styles.h2}>{L(`Estadísticas a Nv ${p.level}`, `Stats at Lv ${p.level}`)}</h2>
              {STATS().map(([k, label]) => (
                <div key={k} className={styles.stat}>
                  <span>{label}</span>
                  <i style={{ width: `${(base[k] / top) * 100}%` }} />
                  <b>{base[k]}</b>
                </div>
              ))}
              <p className={styles.note}>
                {L('A Nv 99', 'At Lv 99')}: {STATS().map(([k, label]) => `${label} ${max[k]}`).join(' · ')}
              </p>
            </section>
          </div>
        </div>

        {p.drops.length > 0 && (
          <section className={styles.box}>
            <h2 className={styles.h2}>{L('Dónde aparece', 'Where it appears')}</h2>
            <p className={styles.note}>{L('Puede salir como recompensa al terminar estas misiones:', 'It can drop as a reward after these missions:')}</p>
            <ul className={styles.recipes}>
              {p.drops.map((d) => (
                <li key={d.stage}>
                  <strong>{L(d.es ?? d.en ?? '', d.en ?? d.es ?? '')}</strong>
                  <small> · {d.dlc ? L('DLC «Repaint Your Heart»', '"Repaint Your Heart" DLC') : L(`Reino ${d.kingdom}`, `Kingdom ${d.kingdom}`)}</small>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.box}>
          <h2 className={styles.h2}>{p.special ? L('Fusión especial', 'Special fusion') : L('Cómo conseguirla por fusión', 'How to fuse it')}</h2>
          <FusionNotes p={p} />
          {recipes.length ? (
            <RecipeList items={recipes.map((recipe) => ({ recipe }))} />
          ) : (
            <p className={styles.note}>{L('No sale de ninguna fusión normal.', "It doesn't come from any normal fusion.")}</p>
          )}
        </section>
      </article>
    </>
  );
}
