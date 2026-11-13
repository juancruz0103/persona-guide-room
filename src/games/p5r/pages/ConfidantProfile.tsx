import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackButton } from '../../../shared/components/BackButton';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { confidantAltImage, confidantImage } from '../services/images';
import { getArcana } from '../data/arcana';
import { PersonaPeek } from '../components/PersonaPeek';
import {
  KIND_LABEL,
  analyzeConversation,
  getConfidantSummary,
  loadConfidant,
  ultimatePersona,
  type ConfidantSummary,
} from '../services/confidants';
import { personaName, skillName } from '../services/gameText';
import { getPersona } from '../services/personas';
import type { Confidant, Conversation, FusionRequest, MementosMission, RankItem, TimelineRank } from '../types';
import rankMaxImg from '../assets/ui/rango-max.webp';
import styles from './ConfidantProfile.module.css';

function MementosNote({ m }: { m: MementosMission }) {
  return (
    <div className={styles.mission}>
      <span className={styles.missionKicker}>Misión de Mementos</span>
      <span className={styles.missionTitle}>«{m.title}»</span>
      <span className={styles.missionDesc}>{m.description}</span>
      <span className={styles.missionHint}>Complétala en Mementos para seguir con este confidente.</span>
    </div>
  );
}

const isConv = (c: RankItem): c is Conversation => c.kind !== 'mementos';

const ROUTE_TEXT = {
  romance: 'Solo aparece si elegiste el romance.',
  friend: 'Solo aparece si seguís como amigos (rechazaste el romance).',
};

function ConversationCard({
  c,
  index,
  friendHasMore,
  multiStep,
}: {
  c: Conversation;
  index: number;
  friendHasMore?: boolean;
  /** El romance se decide en varias preguntas seguidas del mismo rango */
  multiStep?: boolean;
}) {
  const { max, allSame, hasRecommended } = analyzeConversation(c);
  const isRouteChoice = c.romance && c.kind === 'conversation' && !c.route;
  const title = c.kind === 'phone' ? 'Llamada telefónica' : `Conversación ${index}`;

  return (
    <div className={`${styles.conv} ${c.royalOnly ? styles.convRoyal : ''} ${c.romance ? styles.convRomance : ''}`}>
      <div className={styles.convHead}>
        <span className={styles.convTitle}>
          <span className="label label-accent">{title}</span>
          {c.royalOnly && <span className="tag tag--royal">Solo Royal</span>}
          {c.romance && !c.route && <span className="tag tag--romance">Romance</span>}
          {c.route === 'romance' && <span className="tag tag--romance">Ruta romántica</span>}
          {c.route === 'friend' && <span className="tag tag--muted">Ruta de amistad</span>}
        </span>
        {c.provisional && <span className={styles.provisional}>Traducción provisoria</span>}
      </div>
      {c.prompt.es ? (
        <p className={styles.prompt}>
          <strong>{c.speaker}:</strong> «{c.prompt.es}»
          {c.prompt.en && <small>Original: “{c.prompt.en}”</small>}
        </p>
      ) : (
        <p className={styles.prompt}>
          <strong>{c.speaker}</strong> <small>(en el juego no hay frase antes de esta pregunta)</small>
        </p>
      )}
      {c.route && <p className={styles.routeNote}>{ROUTE_TEXT[c.route]}</p>}
      {isRouteChoice && (
        <p className={styles.routeNote}>
          {multiStep ? (
            'El romance se decide en varias preguntas: hay que elegir la opción en rosa en todas las de este rango. Con cualquier otra respuesta, seguís como amigos.'
          ) : (
            <>
              Esta respuesta decide la ruta: la opción en rosa inicia el romance y la otra mantiene la amistad. Lo que
              sigue en este rango cambia según lo que elijas.
              {friendHasMore === false && ' Si seguís como amigos, no hay más elecciones en este rango.'}
            </>
          )}
        </p>
      )}
      {hasRecommended && (
        <span className={styles.same}>La guía recomienda esta respuesta, pero no dice cuántos puntos da.</span>
      )}
      {allSame && !isRouteChoice && (
        <span className={styles.same}>Todas las opciones dan los mismos puntos: elegí la que quieras.</span>
      )}
      <ol className={styles.options}>
        {c.options.map((o, i) => {
          const best = hasRecommended ? !!o.recommended : !allSame && o.points === max;
          return (
            <li key={i} className={`${styles.option} ${best ? styles.best : ''} ${o.romance ? styles.optRomance : ''}`}>
              <span className={styles.optNum}>Opción {i + 1}</span>
              <span className={styles.optText}>
                <span>«{o.es}»</span>
                {o.en && <small>{o.en}</small>}
              </span>
              <span className={styles.points}>{hasRecommended ? '' : o.points > 0 ? `+${o.points}` : '0'}</span>
              {o.romance && <span className={styles.romanceTag}>Inicia el romance</span>}
              {best && <span className={styles.bestTag}>{hasRecommended ? 'Recomendada' : 'Mejor'}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Timeline({ ranks }: { ranks: TimelineRank[] }) {
  return (
    <ol className={styles.timeline}>
      {ranks.map((r) => (
        <li key={r.rank} className={styles.tlRow}>
          <span className={styles.tlRank}>{r.rank}</span>
          <span className={styles.tlBody}>
            <span className={styles.tlWhen}>{r.when}</span>
            <span className={`${styles.tlAbility} ${r.ability ? '' : styles.tlNone}`}>{r.ability ?? 'Sin habilidad nueva'}</span>
            {r.description && <span className={styles.tlDesc}>{r.description}</span>}
            {r.extra?.map((x) => (
              <span key={x.ability} className={styles.tlExtra}>
                <span className={styles.tlAbility}>{x.ability}</span>
                <span className={styles.tlDesc}>{x.description}</span>
              </span>
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
}

function SpoilerBox({ spoiler }: { spoiler: NonNullable<Confidant['spoiler']> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.spoiler}>
      <div className={styles.spoilerHead}>
        <span>{spoiler.title}</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? 'Ocultar' : 'Mostrar spoilers'}
        </button>
      </div>
      {open ? (
        <>
          <ol className={styles.spoilerList}>
            {spoiler.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ol>
          {spoiler.note && <p className={styles.spoilerNote}>{spoiler.note}</p>}
        </>
      ) : (
        <p className={styles.spoilerHidden}>Contiene spoilers de la historia. Tocá «Mostrar spoilers» para verlo.</p>
      )}
    </div>
  );
}

function Requests({ requests }: { requests: FusionRequest[] }) {
  return (
    <ol className={styles.requests}>
      {requests.map((r) => {
        const target = getPersona(r.persona);
        return (
          <li key={r.rank} className={styles.request}>
            <span className={styles.tlRank}>{r.rank}</span>
            <span className={styles.reqMain}>
              {target ? <PersonaPeek persona={target} className={styles.reqPersona} /> : r.persona}
              <span className={styles.reqSkill}>
                con <strong>{skillName(r.skill)}</strong>
              </span>
            </span>
            <span className={styles.reqCol}>
              <span className={styles.reqLabel}>Armado rápido</span>
              {r.quick.map((combo, i) => (
                <span key={i} className={styles.reqCombo}>
                  {combo.map((id, j) => {
                    const p = getPersona(id);
                    return (
                      <span key={id}>
                        {j > 0 && ' + '}
                        {p ? <PersonaPeek persona={p} /> : id}
                      </span>
                    );
                  })}
                </span>
              ))}
              {r.note && <span className={styles.reqNote}>{r.note}</span>}
            </span>
            <span className={styles.reqCol}>
              <span className={styles.reqLabel}>Recompensa</span>
              {r.reward ? (
                <span>
                  <strong>{r.reward.name}</strong> · {r.reward.description}
                </span>
              ) : (
                <span className={styles.reqNote}>Sin recompensa: las respuestas de la charla no importan.</span>
              )}
            </span>
            {target && (
              <Link to={`/p5r/calculadora/fusionar?modo=inversa&persona=${target.id}`} className={`btn btn--light ${styles.reqBtn}`}>
                Ver recetas
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function UltimateBox({ summary }: { summary: ConfidantSummary }) {
  const ult = ultimatePersona(summary.arcana);
  if (!ult) return null;
  return (
    <div className={styles.ultimate}>
      <span className="label label-accent">Rango 10 · desbloquea</span>
      <PersonaPeek persona={ult} className={styles.ultimateLink} />
      <span className={styles.muted}>para fusionarla ({personaName(ult)}, Nv {ult.level})</span>
    </div>
  );
}

/* ---------- Seguimiento de progreso (se guarda en este navegador) ---------- */

interface Progress {
  tracking: boolean;
  reached: number;
}
const progressKey = (id: string) => `pgr.progress.${id}`;
function loadProgress(id: string): Progress {
  try {
    const raw = localStorage.getItem(progressKey(id));
    if (raw) return JSON.parse(raw) as Progress;
  } catch {
    /* sin almacenamiento */
  }
  return { tracking: false, reached: 0 };
}
function saveProgress(id: string, p: Progress) {
  try {
    localStorage.setItem(progressKey(id), JSON.stringify(p));
  } catch {
    /* sin almacenamiento: el progreso dura mientras la página esté abierta */
  }
}

export default function ConfidantProfile() {
  const { confidantId = '' } = useParams();
  const [data, setData] = useState<Confidant | null | undefined>(undefined);
  const [showAlt, setShowAlt] = useState(false);
  const [sel, setSel] = useState(2);
  const [tracking, setTracking] = useState(false);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const saved = loadProgress(confidantId);
    setTracking(saved.tracking);
    setReached(saved.reached);
    setSel(saved.tracking ? Math.min(saved.reached + 1, 10) : 2);
  }, [confidantId]);

  useEffect(() => {
    let alive = true;
    loadConfidant(confidantId).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [confidantId]);

  const summary = getConfidantSummary(confidantId);
  if (!summary) {
    return (
      <section className="container" style={{ paddingBlock: 80 }}>
        <p className="pending">No encontramos ese confidente.</p>
        <Link to="/p5r/confidentes">← Volver a confidentes</Link>
      </section>
    );
  }
  if (data === undefined) return <div className="container" style={{ paddingBlock: 80 }}>Cargando…</div>;

  const alt = confidantAltImage(summary.id);
  const arcana = getArcana(summary.arcana);
  const kind = summary.kind;
  const maxRank = data?.maxRank ?? 10;
  const rank = data?.ranks.find((r) => r.rank === sel);
  const ranks = Array.from({ length: maxRank }, (_, i) => i + 1);
  const thiefPersona = summary.persona ? getPersona(summary.persona) : undefined;

  // Un rango «sin respuestas» (nada que elegir en la ficha) se puede dar por hecho al empezar
  const hasAnswers = (n: number) =>
    data?.ranks.find((r) => r.rank === n)?.conversations.some((c) => c.kind !== 'mementos') ?? false;
  const startReached = () => (hasAnswers(1) ? 0 : 1);
  const persist = (t: boolean, r: number) => saveProgress(confidantId, { tracking: t, reached: r });
  const goTo = (r: number) => setSel(Math.min(r + 1, maxRank));

  const toggleTracking = () => {
    if (tracking) {
      setTracking(false);
      persist(false, reached);
      return;
    }
    const r = reached > 0 ? reached : startReached();
    setTracking(true);
    setReached(r);
    goTo(r);
    persist(true, r);
  };
  const markReached = () => {
    if (sel !== reached + 1) return;
    setReached(sel);
    persist(true, sel);
    if (sel < maxRank) setSel(sel + 1);
  };
  const resetProgress = () => {
    const r = startReached();
    setReached(r);
    goTo(r);
    persist(true, r);
  };

  return (
    <article>
      <div className={`container ${styles.back}`}>
        <BackButton fallback="/p5r/confidentes" />
      </div>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.portraitWrap}>
            <ImagePlaceholder
              className={styles.portrait}
              label={confidantImage(summary.id) ? summary.name : 'Retrato del confidente'}
              icon="person"
              src={showAlt && alt ? alt.src : confidantImage(summary.id)}
            />
            {alt && (
              <button
                type="button"
                className={styles.altBtn}
                aria-pressed={showAlt}
                onClick={() => setShowAlt((v) => !v)}
                title={showAlt ? 'Volver a la foto sin spoiler' : `Ver ${alt.label} (spoiler)`}
              >
                <span aria-hidden="true">⇄</span>
                {showAlt ? 'Sin spoiler' : 'Spoiler'}
              </button>
            )}
          </div>
          <div className={styles.heroText}>
            <span className={styles.arcanaTag}>{arcana.name} · Arcana {arcana.numeral}</span>
            <h1 className={styles.name}>{summary.name}</h1>
            <div className={styles.heroTags}>
              {summary.phantomThief && <span className={styles.solid}>Ladrón Fantasma</span>}
              {kind !== 'normal' && <span className={styles.solidGold}>{KIND_LABEL[kind]}</span>}
              <span className={styles.outline}>{summary.romance ? 'Ruta romántica' : 'Sin romance'}</span>
              <span className={styles.outline}>{maxRank} rangos</span>
              {thiefPersona && (
                <PersonaPeek persona={thiefPersona} className={styles.personaChip} side>
                  Persona: {personaName(thiefPersona)} →
                </PersonaPeek>
              )}
            </div>
            {kind === 'normal' && (
            <div className={styles.trackRow}>
              <button
                type="button"
                role="switch"
                aria-checked={tracking}
                aria-label="Seguimiento de progreso"
                onClick={toggleTracking}
                className={`${styles.switch} ${tracking ? styles.switchOn : ''}`}
              >
                <span />
              </button>
              <span className={styles.trackLabel}>
                Seguimiento de progreso: {tracking ? 'activado' : 'desactivado'}
              </span>
              <span className={styles.trackNote}>Se guarda en este navegador · con tu cuenta en la v2</span>
            </div>
            )}
          </div>
        </div>
      </section>

      {summary.notice && (
        <div className={`container ${styles.noticeWrap}`}>
          <p className={styles.notice}>
            <strong>Ojo:</strong> {summary.notice}
          </p>
        </div>
      )}

      {data && data.tips.length > 0 && (
        <section className={`container ${styles.infoGrid}`}>
          {data.tips.map((t) => (
            <div key={t} className={styles.info}>
              <span className="label label-accent">Consejo</span>
              <span>{t}</span>
            </div>
          ))}
        </section>
      )}

      {kind === 'auto' && data?.timeline && (
        <section className={`container ${styles.specialBody}`}>
          <h2 className={styles.h2}>Rangos y recompensas</h2>
          <p className={styles.specialLead}>No tenés que hacer nada: cada rango sube solo en el momento indicado.</p>
          <Timeline ranks={data.timeline} />
          {data.spoiler && <SpoilerBox spoiler={data.spoiler} />}
          <UltimateBox summary={summary} />
          <p className={styles.source}>
            Fuente:{' '}
            {data.sources.map((u, i) => (
              <span key={u}>
                {i > 0 && ' · '}
                <a href={u}>guía {i + 1} (RPG Site)</a>
              </span>
            ))}
            . Nombres de habilidades en inglés hasta confirmar los oficiales.
          </p>
        </section>
      )}

      {kind === 'fusion' && data?.requests && (
        <section className={`container ${styles.specialBody}`}>
          <h2 className={styles.h2}>Pedidos de fusión</h2>
          <p className={styles.specialLead}>
            Cada rango te piden una Persona con una skill. Llevala al Velvet Room y sube el rango. Pasá el mouse por
            un nombre para ver la Persona.
          </p>
          <Requests requests={data.requests} />
          <UltimateBox summary={summary} />
          <p className={styles.source}>
            Pedidos y armados: <a href={data.sources[0]}>RPG Site</a> (Royal). Recompensas:{' '}
            <a href={data.sources[1]}>GGRecon</a>.
          </p>
        </section>
      )}

      {kind === 'normal' && (
      <>
      <section className={`container ${styles.ranksSection}`}>
        <h2 className={styles.h2}>Rangos</h2>

        {tracking && (
          <div className={styles.progress}>
            <span className={styles.progressLabel}>
              Tu progreso: <strong>{reached} / {maxRank}</strong>
            </span>
            <span className={styles.progressTrack}>
              <span style={{ width: `${(reached / maxRank) * 100}%` }} />
            </span>
            {reached >= maxRank ? (
              <span className={styles.progressDone}>¡Confidente al máximo!</span>
            ) : sel === reached + 1 ? (
              <button type="button" className="btn btn--accent" onClick={markReached}>
                Marcar rango {sel} como alcanzado
              </button>
            ) : sel <= reached ? (
              <button type="button" className="btn btn--accent" disabled>
                Rango {sel} alcanzado ✓
              </button>
            ) : (
              <button type="button" className="btn btn--light" onClick={() => setSel(reached + 1)}>
                Primero el rango {reached + 1}: ir
              </button>
            )}
            <button type="button" className={`btn btn--light ${styles.resetBtn}`} onClick={resetProgress}>
              Reiniciar progreso
            </button>
          </div>
        )}

        <div className={styles.rankButtons} role="group" aria-label="Elegir rango">
          {ranks.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={n === sel}
              onClick={() => setSel(n)}
              className={`${styles.rankBtn} ${n === sel ? styles.rankSel : ''} ${tracking && n <= reached ? styles.rankDone : ''}`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className={`container ${styles.rankBody}`}>
        <div className={styles.rankMain}>
          <div className={styles.rankTitle}>
            <span className={styles.rankNum}>Rango {sel}</span>
            {rank && rank.conversations.length > 0 && (
              <span className="label" style={{ color: 'var(--c-text-dim)' }}>
                {data?.textsProvisional ? 'Traducción provisoria · falta texto oficial (España)' : 'Texto oficial del juego'}
              </span>
            )}
          </div>

          {sel === maxRank && (
            <div className={styles.rankMax}>
              <img src={rankMaxImg} alt="" width={1536} height={1024} loading="lazy" />
              <span className={styles.rankMaxText}>
                <span className={styles.rankMaxKicker}>Rango máximo</span>
                <span>El vínculo con {data?.name.split(' ')[0]} está al máximo.</span>
              </span>
            </div>
          )}

          {rank?.requirements && (
            <div className={styles.requirements}>
              <span className={styles.requirementsKicker}>Requisito para este rango</span>
              <ul>
                {rank.requirements.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {rank?.noData || rank?.choicesDontMatter ? (
            <>
              {rank.noData ? (
                <p className="pending">
                  Este rango tiene respuestas en el juego, pero la guía que usamos no dice cuántos puntos da cada una.
                  Las cargamos cuando las confirmemos con otra fuente.
                </p>
              ) : (
                <div className={styles.dontMatter}>En este rango las respuestas no cambian los puntos: elegí la que quieras.</div>
              )}
              {rank.conversations.map((c, i) => (c.kind === 'mementos' ? <MementosNote key={i} m={c} /> : null))}
            </>
          ) : rank ? (
            (() => {
              let n = 0;
              const convs = rank.conversations.filter(isConv);
              const friendHasMore = convs.some((x) => x.route === 'friend');
              const multiStep = convs.filter((x) => x.romance && x.kind === 'conversation' && !x.route).length > 1;
              return rank.conversations.map((c, i) =>
                c.kind === 'mementos' ? (
                  <MementosNote key={i} m={c} />
                ) : (
                  <ConversationCard
                    key={i}
                    c={c}
                    index={c.kind === 'phone' ? 0 : ++n}
                    friendHasMore={friendHasMore}
                    multiStep={multiStep}
                  />
                ),
              );
            })()
          ) : (
            <p className="pending">Las respuestas de este rango todavía no están cargadas.</p>
          )}
        </div>

        <aside className={styles.rankSide}>
          <h3 className={styles.h3}>Recompensa del rango</h3>
          {rank && rank.unlocks.length > 0 ? (
            rank.unlocks.map((u) => (
              <div key={u.name} className={styles.reward}>
                <span className={styles.rewardKicker}>Desbloqueás</span>
                <span className={styles.rewardName}>{u.name}</span>
                <span className={styles.rewardDesc}>{u.description}</span>
              </div>
            ))
          ) : rank?.noReward ? (
            <p className={styles.noReward}>Este rango no da ninguna recompensa.</p>
          ) : (
            <p className="pending">Todavía no está cargada.</p>
          )}
          <ul className={styles.legend}>
            <li><span style={{ background: 'var(--c-accent)' }} /> Mejor respuesta</li>
            <li><span style={{ background: 'var(--c-royal)' }} /> Exclusivo de Royal</li>
            {summary.romance && <li><span style={{ background: 'var(--c-romance)' }} /> Opción de romance</li>}
          </ul>
          {data && (
            <p className={styles.source}>
              Puntos y respuestas: <a href={data.sources[0]}>RPG Site</a>.
            </p>
          )}
        </aside>
      </section>
      <div className="container">
        <UltimateBox summary={summary} />
      </div>
      </>
      )}
    </article>
  );
}
