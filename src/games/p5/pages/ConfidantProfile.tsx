import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackButton } from '../../../shared/components/BackButton';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { confidantAltImage, confidantImage } from '../../p5r/services/images';
import { getArcana } from '../../p5r/data/arcana';
import { PersonaPeek } from '../components/PersonaPeek';
import {
  KIND_LABEL,
  analyzeConversation,
  getConfidantSummary,
  loadConfidant,
  progressId,
  ultimatePersona,
  type ConfidantSummary,
} from '../services/confidants';
import { personaName, skillName } from '../../p5r/services/gameText';
import { getPersona } from '../services/personas';
import type { Confidant, Conversation, FusionRequest, MementosMission, RankItem, TimelineRank } from '../../p5r/types';
import rankMaxImg from '../assets/ui/rango-max.webp';
import styles from '../../p5r/pages/ConfidantProfile.module.css';
import { useConfidantProgress } from '../../../core/account/progress';
import { useAuth } from '../../../core/account/AuthContext';
import { L, bilingual, isEn, tr } from '../../../i18n';

function MementosNote({ m }: { m: MementosMission }) {
  return (
    <div className={styles.mission}>
      <span className={styles.missionKicker}>{L('Misión de Mementos', 'Mementos request')}</span>
      <span className={styles.missionTitle}>«{tr(m.title)}»</span>
      <span className={styles.missionDesc}>{tr(m.description)}</span>
      <span className={styles.missionHint}>{L('Complétala en Mementos para seguir con este confidente.', 'Complete it in Mementos to continue with this confidant.')}</span>
    </div>
  );
}

const isConv = (c: RankItem): c is Conversation => c.kind !== 'mementos';

const ROUTE_TEXT = bilingual({
  romance: 'Solo aparece si elegiste el romance.',
  friend: 'Solo aparece si seguís como amigos (rechazaste el romance).',
}, { romance: 'Only shows up if you chose the romance.', friend: 'Only shows up if you stay friends (you turned down the romance).' });

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
  const title = c.kind === 'phone' ? L('Llamada telefónica', 'Phone call') : `${L('Conversación', 'Conversation')} ${index}`;

  return (
    <div className={`${styles.conv} ${c.royalOnly ? styles.convRoyal : ''} ${c.romance ? styles.convRomance : ''}`}>
      <div className={styles.convHead}>
        <span className={styles.convTitle}>
          <span className="label label-accent">{title}</span>
          {c.royalOnly && <span className="tag tag--royal">{L('Solo Royal', 'Royal only')}</span>}
          {c.romance && !c.route && <span className="tag tag--romance">Romance</span>}
          {c.route === 'romance' && <span className="tag tag--romance">{L('Ruta romántica', 'Romance route')}</span>}
          {c.route === 'friend' && <span className="tag tag--muted">{L('Ruta de amistad', 'Friendship route')}</span>}
        </span>
        {c.provisional && !isEn() && <span className={styles.provisional}>Traducción provisoria</span>}
      </div>
      {isEn() && (c.prompt.en || c.prompt.es) ? (
        <p className={styles.prompt}>
          <strong>{c.speaker}:</strong> «{c.prompt.en || c.prompt.es}»
        </p>
      ) : c.prompt.es ? (
        <p className={styles.prompt}>
          <strong>{c.speaker}:</strong> «{c.prompt.es}»
        </p>
      ) : (
        <p className={styles.prompt}>
          <strong>{c.speaker}</strong> <small>{L('(en el juego no hay frase antes de esta pregunta)', '(in the game there is no line before this question)')}</small>
        </p>
      )}
      {c.route && <p className={styles.routeNote}>{ROUTE_TEXT[c.route]}</p>}
      {isRouteChoice && (
        <p className={styles.routeNote}>
          {multiStep ? (
            L('El romance se decide en varias preguntas: hay que elegir la opción en rosa en todas las de este rango. Con cualquier otra respuesta, seguís como amigos.', 'The romance is decided over several questions: you have to pick the pink option in all of them in this rank. With any other answer, you stay friends.')
          ) : (
            <>
              {L('Esta respuesta decide la ruta: la opción en rosa inicia el romance y la otra mantiene la amistad. Lo que sigue en este rango cambia según lo que elijas.', 'This answer decides the route: the pink option starts the romance and the other keeps the friendship. What follows in this rank changes depending on your choice.')}
              {friendHasMore === false && L(' Si seguís como amigos, no hay más elecciones en este rango.', ' If you stay friends, there are no more choices in this rank.')}
            </>
          )}
        </p>
      )}
      {hasRecommended && (
        <span className={styles.same}>{L('La guía recomienda esta respuesta, pero no dice cuántos puntos da.', 'The guide recommends this answer, but does not say how many points it gives.')}</span>
      )}
      {allSame && !isRouteChoice && (
        <span className={styles.same}>{L('Todas las opciones dan los mismos puntos: elegí la que quieras.', 'All options give the same points: pick whichever you like.')}</span>
      )}
      <ol className={styles.options}>
        {c.options.map((o, i) => {
          const best = hasRecommended ? !!o.recommended : !allSame && o.points === max;
          return (
            <li key={i} className={`${styles.option} ${best ? styles.best : ''} ${o.romance ? styles.optRomance : ''}`}>
              <span className={styles.optNum}>{L('Opción', 'Option')} {i + 1}</span>
              <span className={styles.optText}>
                <span>«{isEn() ? o.en || o.es : o.es}»</span>
              </span>
              <span className={styles.points}>{hasRecommended ? '' : o.points > 0 ? `+${o.points}` : '0'}</span>
              {o.romance && <span className={styles.romanceTag}>{L('Inicia el romance', 'Starts the romance')}</span>}
              {best && <span className={styles.bestTag}>{hasRecommended ? L('Recomendada', 'Recommended') : L('Mejor', 'Best')}</span>}
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
            <span className={styles.tlWhen}>{tr(r.when)}</span>
            <span className={`${styles.tlAbility} ${r.ability ? '' : styles.tlNone}`}>{r.ability ? tr(r.ability) : L('Sin habilidad nueva', 'No new ability')}</span>
            {r.description && <span className={styles.tlDesc}>{tr(r.description)}</span>}
            {r.extra?.map((x) => (
              <span key={x.ability} className={styles.tlExtra}>
                <span className={styles.tlAbility}>{tr(x.ability)}</span>
                <span className={styles.tlDesc}>{tr(x.description)}</span>
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
        <span>{tr(spoiler.title)}</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? L('Ocultar', 'Hide') : L('Mostrar spoilers', 'Show spoilers')}
        </button>
      </div>
      {open ? (
        <>
          <ol className={styles.spoilerList}>
            {spoiler.items.map((it) => (
              <li key={it}>{tr(it)}</li>
            ))}
          </ol>
          {spoiler.note && <p className={styles.spoilerNote}>{tr(spoiler.note)}</p>}
        </>
      ) : (
        <p className={styles.spoilerHidden}>{L('Contiene spoilers de la historia. Tocá «Mostrar spoilers» para verlo.', 'Contains story spoilers. Tap «Show spoilers» to see it.')}</p>
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
                {L('con', 'with')} <strong>{skillName(r.skill)}</strong>
              </span>
            </span>
            <span className={styles.reqCol}>
              <span className={styles.reqLabel}>{L('Armado rápido', 'Quick recipe')}</span>
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
              {r.note && <span className={styles.reqNote}>{tr(r.note)}</span>}
            </span>
            <span className={styles.reqCol}>
              <span className={styles.reqLabel}>{L('Recompensa', 'Reward')}</span>
              {r.reward ? (
                <span>
                  <strong>{tr(r.reward.name)}</strong> · {tr(r.reward.description)}
                </span>
              ) : (
                <span className={styles.reqNote}>{L('Sin recompensa: las respuestas de la charla no importan.', 'No reward: the answers in the talk do not matter.')}</span>
              )}
            </span>
            {target && (
              <Link to={`/p5/calculadora/fusionar?modo=inversa&persona=${target.id}`} className={`btn btn--light ${styles.reqBtn}`}>
                {L('Ver recetas', 'See recipes')}
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
      <span className="label label-accent">{L('Rango 10 · desbloquea', 'Rank 10 · unlocks')}</span>
      <PersonaPeek persona={ult} className={styles.ultimateLink} />
      <span className={styles.muted}>{L('para fusionarla', 'to fuse it')} ({personaName(ult)}, {L('Nv', 'Lv')} {ult.level})</span>
    </div>
  );
}

export default function ConfidantProfile() {
  const { confidantId = '' } = useParams();
  const [data, setData] = useState<Confidant | null | undefined>(undefined);
  const [showAlt, setShowAlt] = useState(false);
  const [sel, setSel] = useState(2);
  const [progress, saveProgress] = useConfidantProgress(progressId(confidantId));
  const { tracking, reached } = progress;
  const { user } = useAuth();

  useEffect(() => {
    setSel(progress.tracking ? Math.min(progress.reached + 1, 10) : 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confidantId, progress.tracking]);

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
        <p className="pending">{L('No encontramos ese confidente.', 'We could not find that confidant.')}</p>
        <Link to="/p5/confidentes">{L('← Volver a confidentes', '← Back to confidants')}</Link>
      </section>
    );
  }
  if (data === undefined) return <div className="container" style={{ paddingBlock: 80 }}>{L('Cargando…', 'Loading…')}</div>;

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
  const persist = (t: boolean, r: number) => saveProgress({ tracking: t, reached: r });
  const goTo = (r: number) => setSel(Math.min(r + 1, maxRank));

  const toggleTracking = () => {
    if (tracking) {
      persist(false, reached);
      return;
    }
    const r = reached > 0 ? reached : startReached();
    goTo(r);
    persist(true, r);
  };
  const markReached = () => {
    if (sel !== reached + 1) return;
    persist(true, sel);
    if (sel < maxRank) setSel(sel + 1);
  };
  const resetProgress = () => {
    const r = startReached();
    goTo(r);
    persist(true, r);
  };

  return (
    <article>
      <div className={`container ${styles.back}`}>
        <BackButton fallback="/p5/confidentes" />
      </div>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.portraitWrap}>
            <ImagePlaceholder
              className={styles.portrait}
              label={confidantImage(summary.id) ? tr(summary.name) : L('Retrato del confidente', 'Confidant portrait')}
              icon="person"
              src={showAlt && alt ? alt.src : confidantImage(summary.id)}
            />
            {alt && (
              <button
                type="button"
                className={styles.altBtn}
                aria-pressed={showAlt}
                onClick={() => setShowAlt((v) => !v)}
                title={showAlt ? L('Volver a la foto sin spoiler', 'Back to the spoiler-free picture') : `${L('Ver', 'See')} ${tr(alt.label)} (spoiler)`}
              >
                <span aria-hidden="true">⇄</span>
                {showAlt ? L('Sin spoiler', 'No spoiler') : 'Spoiler'}
              </button>
            )}
          </div>
          <div className={styles.heroText}>
            <span className={styles.arcanaTag}>{arcana.name} · Arcana {arcana.numeral}</span>
            <h1 className={styles.name}>{tr(summary.name)}</h1>
            <div className={styles.heroTags}>
              {summary.phantomThief && <span className={styles.solid}>{L('Ladrón Fantasma', 'Phantom Thief')}</span>}
              {kind !== 'normal' && <span className={styles.solidGold}>{KIND_LABEL[kind]}</span>}
              <span className={styles.outline}>{summary.romance ? L('Ruta romántica', 'Romance route') : L('Sin romance', 'No romance')}</span>
              <span className={styles.outline}>{maxRank} {L('rangos', 'ranks')}</span>
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
                aria-label={L('Seguimiento de progreso', 'Progress tracking')}
                onClick={toggleTracking}
                className={`${styles.switch} ${tracking ? styles.switchOn : ''}`}
              >
                <span />
              </button>
              <span className={styles.trackLabel}>
                {L('Seguimiento de progreso', 'Progress tracking')}: {tracking ? L('activado', 'on') : L('desactivado', 'off')}
              </span>
              <span className={styles.trackNote}>
                {user ? L('Se guarda en tu cuenta', 'Saved to your account') : <>{L('Se guarda en este navegador', 'Saved in this browser')} · <Link to="/p5/cuenta">{L('entrá', 'log in')}</Link> {L('para guardarlo en tu cuenta', 'to save it to your account')}</>}
              </span>
            </div>
            )}
          </div>
        </div>
      </section>

      {summary.notice && (
        <div className={`container ${styles.noticeWrap}`}>
          <p className={styles.notice}>
            <strong>{L('Ojo:', 'Note:')}</strong> {tr(summary.notice)}
          </p>
        </div>
      )}

      {data && data.tips.length > 0 && (
        <section className={`container ${styles.infoGrid}`}>
          {data.tips.map((t) => (
            <div key={t} className={styles.info}>
              <span className="label label-accent">{L('Consejo', 'Tip')}</span>
              <span>{tr(t)}</span>
            </div>
          ))}
        </section>
      )}

      {kind === 'auto' && data?.timeline && (
        <section className={`container ${styles.specialBody}`}>
          <h2 className={styles.h2}>{L('Rangos y recompensas', 'Ranks and rewards')}</h2>
          <p className={styles.specialLead}>{L('No tenés que hacer nada: cada rango sube solo en el momento indicado.', 'You do not have to do anything: each rank goes up by itself at the given moment.')}</p>
          <Timeline ranks={data.timeline} />
          {data.spoiler && <SpoilerBox spoiler={data.spoiler} />}
          <UltimateBox summary={summary} />
        </section>
      )}

      {kind === 'fusion' && data?.requests && (
        <section className={`container ${styles.specialBody}`}>
          <h2 className={styles.h2}>{L('Pedidos de fusión', 'Fusion requests')}</h2>
          <p className={styles.specialLead}>
            {L('Cada rango te piden una Persona con una skill. Llevala al Velvet Room y sube el rango. Pasá el mouse por un nombre para ver la Persona.', 'Each rank asks you for a Persona with a skill. Bring it to the Velvet Room and the rank goes up. Hover over a name to see the Persona.')}
          </p>
          <Requests requests={data.requests} />
          <UltimateBox summary={summary} />
        </section>
      )}

      {kind === 'normal' && (
      <>
      <section className={`container ${styles.ranksSection}`}>
        <h2 className={styles.h2}>{L('Rangos', 'Ranks')}</h2>

        {tracking && (
          <div className={styles.progress}>
            <span className={styles.progressLabel}>
              {L('Tu progreso', 'Your progress')}: <strong>{reached} / {maxRank}</strong>
            </span>
            <span className={styles.progressTrack}>
              <span style={{ width: `${(reached / maxRank) * 100}%` }} />
            </span>
            {reached >= maxRank ? (
              <span className={styles.progressDone}>{L('¡Confidente al máximo!', 'Confidant maxed!')}</span>
            ) : sel === reached + 1 ? (
              <button type="button" className="btn btn--accent" onClick={markReached}>
                {L(`Marcar rango ${sel} como alcanzado`, `Mark rank ${sel} as reached`)}
              </button>
            ) : sel <= reached ? (
              <button type="button" className="btn btn--accent" disabled>
                {L(`Rango ${sel} alcanzado ✓`, `Rank ${sel} reached ✓`)}
              </button>
            ) : (
              <button type="button" className="btn btn--light" onClick={() => setSel(reached + 1)}>
                {L(`Primero el rango ${reached + 1}: ir`, `First rank ${reached + 1}: go`)}
              </button>
            )}
            <button type="button" className={`btn btn--light ${styles.resetBtn}`} onClick={resetProgress}>
              {L('Reiniciar progreso', 'Reset progress')}
            </button>
          </div>
        )}

        <div className={styles.rankButtons} role="group" aria-label={L('Elegir rango', 'Choose rank')}>
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
            <span className={styles.rankNum}>{L('Rango', 'Rank')} {sel}</span>
            {rank && rank.conversations.length > 0 && (
              <span className="label" style={{ color: 'var(--c-text-dim)' }}>
                {isEn() ? 'Official game text' : data?.textsProvisional ? 'Traducción provisoria · falta texto oficial (España)' : 'Texto oficial del juego'}
              </span>
            )}
          </div>

          {sel === maxRank && (
            <div className={styles.rankMax}>
              <img src={rankMaxImg} alt="" width={720} height={682} loading="lazy" />
              <span className={styles.rankMaxText}>
                <span className={styles.rankMaxKicker}>{L('Rango máximo', 'Max rank')}</span>
                <span>{L(`El vínculo con ${data?.name.split(' ')[0]} está al máximo.`, `Your bond with ${data?.name.split(' ')[0]} is at its max.`)}</span>
              </span>
            </div>
          )}

          {rank?.notes && (
            <div className={styles.rankNote}>
              {rank.notes.map((t) => (
                <p key={t}>{tr(t)}</p>
              ))}
            </div>
          )}

          {rank?.requirements && (
            <div className={styles.requirements}>
              <span className={styles.requirementsKicker}>{L('Requisito para este rango', 'Requirement for this rank')}</span>
              <ul>
                {rank.requirements.map((t) => (
                  <li key={t}>{tr(t)}</li>
                ))}
              </ul>
            </div>
          )}

          {rank && !rank.noData && !rank.choicesDontMatter && rank.conversations.some(isConv) && (
            <p className={styles.pointsHint}>
              {L('Los puntos son las notas (♪) que da cada respuesta en el juego, contando la nota extra por llevar una Persona del Arcana del confidente (máximo 3). Llevá siempre una.', 'Points are the notes (♪) each answer gives in the game, counting the extra note for carrying a Persona of the confidant\'s Arcana (max 3). Always bring one.')}
            </p>
          )}

          {rank?.noData || rank?.choicesDontMatter ? (
            <>
              {rank.noData ? (
                <p className="pending">
                  {L('Este rango tiene respuestas en el juego, pero la guía que usamos no dice cuántos puntos da cada una. Las cargamos cuando las confirmemos con otra fuente.', 'This rank has answers in the game, but our guide does not say how many points each gives. We will add them once confirmed with another source.')}
                </p>
              ) : (
                <div className={styles.dontMatter}>{L('En este rango las respuestas no cambian los puntos: elegí la que quieras.', 'In this rank the answers do not change the points: pick whichever you like.')}</div>
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
            <p className="pending">{L('Las respuestas de este rango todavía no están cargadas.', 'The answers for this rank are not loaded yet.')}</p>
          )}
        </div>

        <aside className={styles.rankSide}>
          <h3 className={styles.h3}>{L('Recompensa del rango', 'Rank reward')}</h3>
          {rank && rank.unlocks.length > 0 ? (
            rank.unlocks.map((u) => (
              <div key={u.name} className={styles.reward}>
                <span className={styles.rewardKicker}>{L('Desbloqueás', 'You unlock')}</span>
                <span className={styles.rewardName}>{tr(u.name)}</span>
                <span className={styles.rewardDesc}>{tr(u.description)}</span>
              </div>
            ))
          ) : rank?.noReward ? (
            <p className={styles.noReward}>{L('Este rango no da ninguna recompensa.', 'This rank gives no reward.')}</p>
          ) : (
            <p className="pending">{L('Todavía no está cargada.', 'Not loaded yet.')}</p>
          )}
          <ul className={styles.legend}>
            <li><span style={{ background: 'var(--c-accent)' }} /> {L('Mejor respuesta', 'Best answer')}</li>
            {summary.romance && <li><span style={{ background: 'var(--c-romance)' }} /> {L('Opción de romance', 'Romance option')}</li>}
          </ul>
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
