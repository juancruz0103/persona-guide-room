import { Link, Navigate, useParams } from 'react-router-dom';
import { LinkPortrait } from '../components/LinkPortrait';
import { PersonaPeek } from '../components/PersonaPeek';
import { getArcana } from '../data/arcana';
import { scheduleText } from '../data/links';
import { eventsByRank, getLink, maxPersona, progressId, type LinkChoice } from '../services/links';
import { useConfidantProgress } from '../../../core/account/progress';
import { SpoilerCover } from '../../p5r/components/SpoilerCover';
import styles from './LinkProfile.module.css';
import { L, isEn } from '../../../i18n';

/** El juego guarda el nombre del protagonista aparte: "-kun" → "Makoto-kun". */
const withName = (s: string) => s.replace(/(^|[\s¿¡"“(])-(kun|san|chan|dono|sama)/g, '$1Makoto-$2');

const routeLabel = (r: '' | 'R' | 'P') => (r === 'R' ? L('Ruta romántica', 'Romance route') : r === 'P' ? L('Ruta de amistad', 'Friendship route') : '');

function Choice({ c }: { c: LinkChoice }) {
  const best = Math.max(...c.opts.map((o) => o.pts));
  return (
    <div className={styles.choice}>
      {c.q && (
        <blockquote className={styles.q}>
          {c.speaker && <cite>{c.speaker}</cite>}
          <span>“{withName(L(c.q, c.qEn))}”</span>
          {!isEn() && <small>{withName(c.qEn)}</small>}
        </blockquote>
      )}
      <ul className={styles.opts}>
        {c.opts.map((o, i) => (
          <li key={i} className={best > 0 && o.pts === best ? styles.best : ''}>
            <span>
              {withName(L(o.es, o.en))}
              {!isEn() && <small>{withName(o.en)}</small>}
            </span>
            {o.route && <span className={styles.route}>{o.route === 'R' ? L('Romance', 'Romance') : L('Amistad', 'Friends')}</span>}
            <b className={o.pts ? styles.pts : styles.zero}>{o.pts ? `+${o.pts}` : '—'}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ficha de un vínculo social: datos, progreso y respuestas rango por rango. */
export default function LinkProfile() {
  const { linkId = '' } = useParams();
  const link = getLink(linkId);
  const [progress, save] = useConfidantProgress(progressId(link?.arcana ?? 'fool'));
  if (!link) return <Navigate to="/p3r/vinculos" replace />;
  const a = getArcana(link.arcana);
  const persona = maxPersona(link.arcana);
  const groups = eventsByRank(link.arcana).filter((g) => g.events.some((e) => e.choices.length));
  const setRank = (n: number) => save({ tracking: true, reached: n });

  const body = (
    <>
      <section className={styles.top}>
        <LinkPortrait arcana={link.arcana} alt={L(link.who[0], link.who[1])} className={styles.photo} />
        <div className={styles.info}>
          <span className="label label-accent">{a.numeral && `${a.numeral} · `}{a.name}</span>
          <h1 className={styles.name}>{L(link.who[0], link.who[1])}</h1>
          {a.link && a.link.replace(/\./g, '') !== link.who[0].replace(/\./g, '') && <p className={styles.sub}>{a.link}</p>}
          <dl className={styles.facts}>
            {link.place && (<><dt>{L('Dónde', 'Where')}</dt><dd>{L(link.place[0], link.place[1])}</dd></>)}
            <dt>{L('Cuándo', 'When')}</dt><dd>{scheduleText(link)}</dd>
            <dt>{L('Cómo empieza', 'How to start')}</dt><dd>{L(link.unlock[0], link.unlock[1])}</dd>
            {link.romance && (<><dt>{L('Romance', 'Romance')}</dt><dd>{L('Sí, desde el rango 9 se elige romance o amistad.', 'Yes, from rank 9 you choose romance or friendship.')}</dd></>)}
            {persona && (<><dt>{L('Al máximo', 'At max rank')}</dt><dd><PersonaPeek persona={persona} /></dd></>)}
          </dl>

          <div className={styles.progress}>
            <span>{L('Tu progreso', 'Your progress')}: <strong>{progress.reached} / 10</strong></span>
            <div className={styles.ranks} role="group" aria-label={L('Rango alcanzado', 'Rank reached')}>
              {Array.from({ length: 11 }, (_, n) => (
                <button key={n} type="button" className={n <= progress.reached && progress.tracking ? styles.rankOn : ''} onClick={() => setRank(n)} aria-pressed={n === progress.reached}>
                  {n}
                </button>
              ))}
            </div>
            {progress.tracking && (
              <button type="button" className={styles.reset} onClick={() => save({ tracking: false, reached: 0 })}>{L('Reiniciar progreso', 'Reset progress')}</button>
            )}
          </div>
        </div>
      </section>

      {link.auto ? (
        <p className={styles.note}>{L('Este vínculo no tiene respuestas para elegir: sube solo a medida que avanza la historia.', 'This link has no answers to choose: it ranks up on its own as the story moves on.')}</p>
      ) : (
        <section className={styles.list}>
          <h2 className={styles.h2}>{L('Qué responder', 'What to answer')}</h2>
          <p className={styles.note}>
            {L('La respuesta resaltada es la que más puntos da. Los puntos ya incluyen el extra por llevar una Persona de la misma Arcana: llevá una siempre. Con "—" no suma nada extra.', 'The highlighted answer gives the most points. Points include the bonus for carrying a Persona of the same Arcana: always bring one. "—" adds nothing extra.')}
          </p>
          {groups.map((g) => {
            const done = progress.tracking && progress.reached >= g.rank;
            const head = (
              <details key={`${g.rank}${g.route}`} className={styles.rank} open={!done && g.rank === Math.min(progress.reached + 1, 10)}>
                <summary>
                  <span>{g.rank === 1 ? L('Inicio · rango 1', 'Start · rank 1') : L(`Rango ${g.rank - 1} → ${g.rank}`, `Rank ${g.rank - 1} → ${g.rank}`)}</span>
                  {g.route && <span className={styles.route}>{routeLabel(g.route)}</span>}
                  {done && <span className={styles.done}>{L('Hecho', 'Done')}</span>}
                </summary>
                {g.events.flatMap((e) => e.choices).map((c, i) => <Choice key={i} c={c} />)}
              </details>
            );
            return g.rank >= 9 && g.route ? <SpoilerCover key={`${g.rank}${g.route}`} active label={L(`Spoiler · ${routeLabel(g.route)}, rango ${g.rank}`, `Spoiler · ${routeLabel(g.route)}, rank ${g.rank}`)} className={styles.spoiler}>{head}</SpoilerCover> : head;
          })}
        </section>
      )}
      <p className={styles.credit}>{L('Puntos, lugares y días: guía de RPG Site. Diálogos: textos oficiales del juego.', 'Points, places and days: RPG Site guide. Dialogue: official game text.')}</p>
    </>
  );

  return (
    <div className={`container ${styles.page}`}>
      <Link to="/p3r/vinculos" className={styles.back}>← {L('Todos los vínculos', 'All Social Links')}</Link>
      {body}
    </div>
  );
}
