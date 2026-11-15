import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LinkPortrait } from '../components/LinkPortrait';
import { PersonaPeek } from '../components/PersonaPeek';
import { getArcana } from '../data/arcana';
import { scheduleText } from '../data/links';
import { eventsByRank, getLink, maxPersona, progressId, type LinkChoice } from '../services/links';
import { useConfidantProgress } from '../../../core/account/progress';
import { useAuth } from '../../../core/account/AuthContext';
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

/** Ficha de un vínculo social: datos, seguimiento y respuestas del rango elegido (como en Royal). */
export default function LinkProfile() {
  const { linkId = '' } = useParams();
  const link = getLink(linkId);
  const [progress, save] = useConfidantProgress(progressId(link?.arcana ?? 'fool'));
  const { tracking, reached } = progress;
  const { user } = useAuth();
  const [sel, setSel] = useState(1);
  useEffect(() => {
    setSel(tracking ? Math.min(reached + 1, 10) : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, tracking]);
  if (!link) return <Navigate to="/p3r/vinculos" replace />;
  const a = getArcana(link.arcana);
  const persona = maxPersona(link.arcana);
  const groups = eventsByRank(link.arcana).filter((g) => g.events.some((e) => e.choices.length));
  const shown = groups.filter((g) => g.rank === sel);

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

  const group = (g: (typeof groups)[number]) => {
    const box = (
      <div key={`${g.rank}${g.route}`} className={styles.rank}>
        {g.route && <span className={styles.route}>{routeLabel(g.route)}</span>}
        {g.events.flatMap((e) => e.choices).map((c, i) => <Choice key={i} c={c} />)}
      </div>
    );
    return g.rank >= 9 && g.route ? (
      <SpoilerCover key={`${g.rank}${g.route}`} active label={L(`Spoiler · ${routeLabel(g.route)}`, `Spoiler · ${routeLabel(g.route)}`)} className={styles.spoiler}>{box}</SpoilerCover>
    ) : box;
  };

  return (
    <div className={`container ${styles.page}`}>
      <Link to="/p3r/vinculos" className={styles.back}>← {L('Todos los vínculos', 'All Social Links')}</Link>
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
          <div className={styles.trackRow}>
            <button type="button" role="switch" aria-checked={tracking} aria-label={L('Seguimiento de progreso', 'Progress tracking')} onClick={toggle} className={`${styles.switch} ${tracking ? styles.switchOn : ''}`}>
              <span />
            </button>
            <span className={styles.trackLabel}>{L('Seguimiento de progreso', 'Progress tracking')}: {tracking ? L('activado', 'on') : L('desactivado', 'off')}</span>
            <span className={styles.trackNote}>
              {user ? L('Se guarda en tu cuenta', 'Saved to your account') : <>{L('Se guarda en este navegador', 'Saved in this browser')} · <Link to="/p3r/cuenta">{L('entrá', 'log in')}</Link> {L('para guardarlo en tu cuenta', 'to save it to your account')}</>}
            </span>
          </div>
        </div>
      </section>

      {link.auto ? (
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
          {shown.length ? (
            <>
              <p className={styles.note}>
                {L('La respuesta resaltada es la que más puntos da. Los puntos ya incluyen el extra por llevar una Persona de la misma Arcana: llevá una siempre. Con "—" no suma nada extra.', 'The highlighted answer gives the most points. Points include the bonus for carrying a Persona of the same Arcana: always bring one. "—" adds nothing extra.')}
              </p>
              {shown.map(group)}
            </>
          ) : (
            <div className={styles.dontMatter}>{L('En este rango no hay respuestas que elegir.', 'There are no answers to choose at this rank.')}</div>
          )}
        </section>
      )}
      <p className={styles.credit}>{L('Puntos, lugares y días: guía de RPG Site. Diálogos: textos oficiales del juego.', 'Points, places and days: RPG Site guide. Dialogue: official game text.')}</p>
    </div>
  );
}
