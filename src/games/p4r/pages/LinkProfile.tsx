import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LinkPortrait } from '../components/LinkPortrait';
import { BackButton } from '../../../shared/components/BackButton';
import { PersonaPeek } from '../components/PersonaPeek';
import { getArcana } from '../data/arcana';
import { rankRewards, scheduleText, type LinkMeta, type Reward } from '../data/links';
import { SkillPeek } from '../components/SkillPeek';
import { eventsByRank, getLink, maxPersona, progressId, type LinkChoice, type Route } from '../services/links';
import { getPersona } from '../services/personas';
import { skillName } from '../services/text';
import { useConfidantProgress } from '../../../core/account/progress';
import { useAuth } from '../../../core/account/AuthContext';
import styles from './P3LinkProfile.module.css';
import tl from './ConfidantProfile.module.css';
import rankMaxImg from '../../p4g/assets/rango-max.webp';
import { L } from '../../../i18n';

/** El juego guarda el nombre del protagonista aparte ({P}); usamos el del anime. */
const withName = (s: string) => s.replace(/\{P\}/g, 'Yu');

const routeLabel = (r: Route) => (r === 'L' ? L('Ruta romántica', 'Romance route') : r === 'F' ? L('Ruta de amistad', 'Friendship route') : '');

function Choice({ c }: { c: LinkChoice }) {
  const best = Math.max(...c.opts.map((o) => o.pts));
  return (
    <div className={styles.choice}>
      {c.q && (
        <blockquote className={styles.q}>
          {c.speaker && <cite>{L(c.speaker, c.speakerEn || c.speaker)}</cite>}
          <span>“{withName(L(c.q, c.qEn || c.q))}”</span>
        </blockquote>
      )}
      <ul className={styles.opts}>
        {c.opts.map((o, i) => (
          <li key={i} className={`${best > 0 && o.pts === best ? styles.best : ''} ${o.route ? styles.romanceOpt : ''}`}>
            <span>{withName(L(o.es, o.en))}</span>
            {o.route && <span className={`${styles.route} ${styles.routeR}`}>{L('Lleva al romance', 'Leads to romance')}</span>}
            <b className={o.pts ? styles.pts : styles.zero}>{o.pts ? `+${o.pts}` : '—'}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Recompensas de un rango: skills (con descripción al pasar el cursor), habilidades y objetos. */
function Rewards({ items, compact }: { items: Reward[]; compact?: boolean }) {
  if (!items.length) {
    return compact ? null : (
      <div className={styles.rewardBox}>
        <span className={styles.rewardHead}>{L('Recompensa', 'Reward')}</span>
        <span>{L('Ninguna extra: este rango solo sube el bonus de EXP al fusionar Personas de esta Arcana.', 'Nothing extra: this rank only raises the EXP bonus when fusing Personas of this Arcana.')}</span>
      </div>
    );
  }
  const list = (
    <ul className={styles.rewardList}>
      {items.map((r, i) => (
        <li key={i}>
          {r.type === 'skill' ? <>{L('Aprende', 'Learns')} <SkillPeek skill={r.skill} /></>
            : r.type === 'item' ? <>{L('Objeto clave', 'Key item')}: <strong>{L(r.item[0], r.item[1])}</strong>{r.desc && (r.desc[0] || r.desc[1]) && <> · <em>{L(r.desc[0], r.desc[1])}</em></>}</>
            : L(r.text[0], r.text[1])}
        </li>
      ))}
    </ul>
  );
  return compact ? list : (
    <div className={styles.rewardBox}>
      <span className={styles.rewardHead}>{L('Recompensa', 'Reward')}</span>
      {list}
    </div>
  );
}

/** Lista de rangos para los vínculos sin respuestas: pedidos de Margaret o fechas (como en Royal). */
function RankList({ link }: { link: LinkMeta }) {
  if (link.requests) {
    return (
      <ol className={tl.timeline}>
        <li className={tl.tlRow}>
          <span className={tl.tlRank}>1</span>
          <span className={tl.tlBody}><span className={tl.tlWhen}>{L('Al hablar con Margaret por primera vez', 'When you first talk to Margaret')}</span></span>
        </li>
        {link.requests.map((r) => {
          const p = getPersona(r.persona);
          return (
            <li key={r.rank} className={tl.tlRow}>
              <span className={tl.tlRank}>{r.rank}</span>
              <span className={tl.tlBody}>
                <span className={tl.tlAbility}>{p ? <PersonaPeek persona={p} /> : r.persona}</span>
                <span className={tl.tlWhen}>{L('Con', 'With')} {skillName(r.skill)}{r.level ? L(` · nivel ${r.level}+`, ` · level ${r.level}+`) : ''}</span>
                {r.note && <span className={tl.tlDesc}>{L(r.note[0], r.note[1])}</span>}
                <Rewards items={rankRewards(link, r.rank)} compact />
              </span>
            </li>
          );
        })}
      </ol>
    );
  }
  return (
    <ol className={tl.timeline}>
      {link.timeline?.map((r) => (
        <li key={r.rank} className={tl.tlRow}>
          <span className={tl.tlRank}>{r.rank}</span>
          <span className={tl.tlBody}>
            <span className={tl.tlWhen}>{L(r.when[0], r.when[1])}</span>
            {r.note && <span className={tl.tlDesc}>{L(r.note[0], r.note[1])}</span>}
            <Rewards items={rankRewards(link, r.rank)} compact />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Ficha de un vínculo social: datos, seguimiento y respuestas del rango elegido (como en Reload). */
export default function LinkProfile() {
  const { linkId = '' } = useParams();
  const link = getLink(linkId);
  const [progress, save] = useConfidantProgress(progressId(link?.id ?? 'fool'));
  const { tracking, reached } = progress;
  const { user } = useAuth();
  const [sel, setSel] = useState(1);
  useEffect(() => {
    setSel(tracking ? Math.min(reached + 1, 10) : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, tracking]);
  if (!link) return <Navigate to="/p4r/vinculos" replace />;
  const a = getArcana(link.arcana);
  const persona = maxPersona(link.arcana);
  const alt = link.alt ? getLink(link.alt) : undefined;
  const groups = eventsByRank(link.id).filter((g) => g.events.some((e) => e.choices.length));
  const shown = groups.filter((g) => g.rank === sel);
  const name = (i: 0 | 1) => link.who[i].split(' ')[0];

  const toggle = () => save({ tracking: !tracking, reached });
  const mark = () => {
    if (sel !== reached + 1) return;
    save({ tracking: true, reached: sel });
    if (sel < 10) setSel(sel + 1);
  };
  const reset = () => {
    save({ tracking: true, reached: 0 });
    setSel(1);
  };

  const maxBox = (
    <div className={styles.rankMax}>
      <img src={rankMaxImg} alt="" width={720} height={663} loading="lazy" />
      <span className={styles.rankMaxText}>
        <span className={styles.rankMaxKicker}>{L('Rango máximo', 'Max rank')}</span>
        <span>{link.id === 'fool'
          ? L('El vínculo con el Equipo de investigación está al máximo.', 'Your bond with the Investigation Team is at its max.')
          : L(`El vínculo con ${name(0)} está al máximo.`, `Your bond with ${name(1)} is at its max.`)}</span>
        {persona && <span>{L('Se desbloquea la fusión de', 'Unlocks the fusion of')} <PersonaPeek persona={persona} />.</span>}
      </span>
    </div>
  );

  const group = (g: (typeof groups)[number]) => (
    <div key={`${g.rank}${g.route}`} className={`${styles.rank} ${g.route === 'L' ? styles.romance : ''}`}>
      {g.route && (
        <span className={styles.routeHead}>
          <span className={styles.route}>{routeLabel(g.route)}</span>
          <small>{g.route === 'L' ? L('Si elegiste el romance con este personaje.', 'If you chose romance with this character.') : L('Si elegiste quedar como amigos.', 'If you chose to stay friends.')}</small>
        </span>
      )}
      {g.events.flatMap((e) => e.choices).map((c, i) => <Choice key={i} c={c} />)}
    </div>
  );

  const body = () => {
    if (link.arcana === 'hermit') {
      return <div className={styles.dontMatter}>{sel === 1
        ? L('El rango 1 llega solo al conocer al Zorro en el santuario.', 'Rank 1 comes on its own when you meet the Fox at the shrine.')
        : L(`Completá el pedido ${sel + 5} de las tablillas (ema) del santuario. No hay respuestas que elegir.`, `Complete request ${sel + 5} from the shrine's ema. There are no answers to choose.`)}</div>;
    }
    if (!shown.length) return <div className={styles.dontMatter}>{L('En este rango no hay respuestas que elegir.', 'There are no answers to choose at this rank.')}</div>;
    return (
      <>
        <p className={styles.note}>
          {L('La respuesta resaltada es la que más puntos da. Los puntos ya incluyen el extra por llevar una Persona de la misma Arcana: llevá una siempre. Con "—" no suma nada extra.', 'The highlighted answer gives the most points. Points include the bonus for carrying a Persona of the same Arcana: always bring one. "—" adds nothing extra.')}
        </p>
        {shown.map(group)}
      </>
    );
  };

  return (
    <div className={`container ${styles.page}`}>
      <div><BackButton fallback="/p4r/vinculos" label={L('Volver', 'Back')} /></div>
      <section className={styles.top}>
        <LinkPortrait link={link} className={styles.photo} />
        <div className={styles.info}>
          <span className="label label-accent">{a.numeral && `${a.numeral} · `}{a.name}</span>
          <h1 className={styles.name}>{L(link.who[0], link.who[1])}</h1>
          <dl className={styles.facts}>
            {link.place && (<><dt>{L('Dónde', 'Where')}</dt><dd>{L(link.place[0], link.place[1])}</dd></>)}
            <dt>{L('Cuándo', 'When')}</dt><dd>{scheduleText(link)}</dd>
            <dt>{L('Cómo empieza', 'How to start')}</dt><dd>{L(link.unlock[0], link.unlock[1])}</dd>
            {alt && (<><dt>{L('La otra opción', 'The other option')}</dt><dd><Link to={`../${alt.id}`} relative="path">{L(alt.who[0], alt.who[1])}</Link></dd></>)}
            {link.romance && (<><dt>{L('Romance', 'Romance')}</dt><dd>{L('Sí: en un rango avanzado se elige romance o amistad.', 'Yes: at a later rank you choose romance or friendship.')}</dd></>)}
            {persona && !link.spoiler && (<><dt>{L('Al máximo', 'At max rank')}</dt><dd><PersonaPeek persona={persona} /></dd></>)}
          </dl>
          {!(link.timeline || link.requests || link.auto) && <div className={styles.trackRow}>
            <button type="button" role="switch" aria-checked={tracking} aria-label={L('Seguimiento de progreso', 'Progress tracking')} onClick={toggle} className={`${styles.switch} ${tracking ? styles.switchOn : ''}`}>
              <span />
            </button>
            <span className={styles.trackLabel}>{L('Seguimiento de progreso', 'Progress tracking')}: {tracking ? L('activado', 'on') : L('desactivado', 'off')}</span>
            <span className={styles.trackNote}>
              {user ? L('Se guarda en tu cuenta', 'Saved to your account') : <>{L('Se guarda en este navegador', 'Saved in this browser')} · <Link to="/p4r/cuenta">{L('entrá', 'log in')}</Link> {L('para guardarlo en tu cuenta', 'to save it to your account')}</>}
            </span>
          </div>}
        </div>
      </section>

      {link.timeline || link.requests ? (
        <section className={styles.list}>
          <h2 className={styles.h2}>{link.requests ? L('Pedidos de fusión', 'Fusion requests') : L('Rangos', 'Ranks')}</h2>
          <p className={styles.note}>{link.requests
            ? L('Cada rango te pide una Persona con una skill. Llevásela a la Velvet Room y sube el rango.', 'Each rank asks for a Persona with a skill. Bring it to the Velvet Room and the rank goes up.')
            : L('No tenés que hacer nada: cada rango sube solo en el momento indicado.', 'You do not have to do anything: each rank goes up by itself at the given moment.')}</p>
          <RankList link={link} />
          {maxBox}
        </section>
      ) : link.auto ? (
        <p className={styles.note}>{L('Este vínculo no tiene respuestas para elegir: sube solo a medida que avanza la historia.', 'This link has no answers to choose: it ranks up on its own as the story moves on.')}</p>
      ) : (
        <section className={styles.list}>
          <h2 className={styles.h2}>{L('Rangos', 'Ranks')}</h2>
          {tracking && (
            <div className={styles.progress}>
              <span className={styles.progressLabel}>{L('Tu progreso', 'Your progress')}: <strong>{reached} / 10</strong></span>
              <span className={styles.progressTrack}><span style={{ width: `${reached * 10}%` }} /></span>
              {reached >= 10 ? (
                <span className={styles.progressDone}>{L('¡Vínculo al máximo!', 'Link maxed!')}</span>
              ) : sel === reached + 1 ? (
                <button type="button" className="btn btn--accent" onClick={mark}>{L(`Marcar rango ${sel} como alcanzado`, `Mark rank ${sel} as reached`)}</button>
              ) : sel <= reached ? (
                <button type="button" className="btn btn--accent" disabled>{L(`Rango ${sel} alcanzado ✓`, `Rank ${sel} reached ✓`)}</button>
              ) : (
                <button type="button" className="btn btn--light" onClick={() => setSel(reached + 1)}>{L(`Primero el rango ${reached + 1}: ir`, `First rank ${reached + 1}: go`)}</button>
              )}
              <button type="button" className={`btn btn--light ${styles.resetBtn}`} onClick={reset}>{L('Reiniciar progreso', 'Reset progress')}</button>
            </div>
          )}
          <div className={styles.rankButtons} role="group" aria-label={L('Elegir rango', 'Choose rank')}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" aria-pressed={n === sel} onClick={() => setSel(n)}
                className={`${styles.rankBtn} ${n === sel ? styles.rankSel : ''} ${tracking && n <= reached ? styles.rankDone : ''}`}>{n}</button>
            ))}
          </div>
          <div className={styles.rankTitle}><span className={styles.rankNum}>{L('Rango', 'Rank')} {sel}</span></div>
          <Rewards items={rankRewards(link, sel)} />
          {sel === 10 && maxBox}
          {body()}
        </section>
      )}
      <p className={styles.credit}>{L('Puntos, lugares y días: guía de RPG Site. Diálogos: textos oficiales del juego.', 'Points, places and days: RPG Site guide. Dialogue: official game text.')}</p>
    </div>
  );
}
