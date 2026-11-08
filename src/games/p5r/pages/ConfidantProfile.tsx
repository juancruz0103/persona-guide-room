import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { getArcana } from '../data/arcana';
import { analyzeConversation, loadConfidant } from '../services/confidants';
import type { Confidant, Conversation } from '../types';
import styles from './ConfidantProfile.module.css';

function ConversationCard({ c, index }: { c: Conversation; index: number }) {
  const { max, allSame } = analyzeConversation(c);
  const title = c.kind === 'phone' ? 'Llamada telefónica' : `Conversación ${index}`;

  return (
    <div className={`${styles.conv} ${c.royalOnly ? styles.convRoyal : ''} ${c.romance ? styles.convRomance : ''}`}>
      <div className={styles.convHead}>
        <span className={styles.convTitle}>
          <span className="label label-accent">{title}</span>
          {c.royalOnly && <span className="tag tag--royal">Solo Royal</span>}
          {c.romance && <span className="tag tag--romance">Romance</span>}
        </span>
      </div>
      <p className={styles.prompt}>
        <strong>{c.speaker}:</strong> «{c.prompt.es}»
        <small>Original: “{c.prompt.en}”</small>
      </p>
      {allSame && (
        <span className={styles.same}>Todas las opciones dan los mismos puntos: elegí la que quieras.</span>
      )}
      <ol className={styles.options}>
        {c.options.map((o, i) => {
          const best = !allSame && o.points === max;
          return (
            <li key={i} className={`${styles.option} ${best ? styles.best : ''}`}>
              <span className={styles.optNum}>Opción {i + 1}</span>
              <span className={styles.optText}>
                <span>«{o.es}»</span>
                <small>{o.en}</small>
              </span>
              <span className={styles.points}>{o.points > 0 ? `+${o.points}` : '0'}</span>
              {best && <span className={styles.bestTag}>Mejor</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function ConfidantProfile() {
  const { confidantId = '' } = useParams();
  const [data, setData] = useState<Confidant | null | undefined>(undefined);
  const [sel, setSel] = useState(2);
  const [tracking, setTracking] = useState(false);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    let alive = true;
    loadConfidant(confidantId).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [confidantId]);

  if (data === undefined) return <div className="container" style={{ paddingBlock: 80 }}>Cargando…</div>;
  if (data === null) {
    return (
      <section className="container" style={{ paddingBlock: 80 }}>
        <p className="pending">Este confidente todavía no tiene guía.</p>
        <Link to="/p5r/confidentes">← Volver a confidentes</Link>
      </section>
    );
  }

  const arcana = getArcana(data.arcana);
  const rank = data.ranks.find((r) => r.rank === sel);
  const ranks = Array.from({ length: data.maxRank }, (_, i) => i + 1);

  return (
    <article>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <ImagePlaceholder className={styles.portrait} label="Retrato del confidente" icon="person" />
          <div className={styles.heroText}>
            <span className={styles.arcanaTag}>{arcana.name} · Arcana {arcana.numeral}</span>
            <h1 className={styles.name}>{data.name}</h1>
            <div className={styles.heroTags}>
              {data.phantomThief && <span className={styles.solid}>Ladrón Fantasma</span>}
              <span className={styles.outline}>{data.romance ? 'Ruta romántica' : 'Sin romance'}</span>
              <span className={styles.outline}>{data.maxRank} rangos</span>
            </div>
            <div className={styles.trackRow}>
              <button
                type="button"
                role="switch"
                aria-checked={tracking}
                aria-label="Seguimiento de progreso"
                onClick={() => setTracking((v) => !v)}
                className={`${styles.switch} ${tracking ? styles.switchOn : ''}`}
              >
                <span />
              </button>
              <span className={styles.trackLabel}>
                Seguimiento de progreso: {tracking ? 'activado' : 'desactivado'}
              </span>
              <span className={styles.trackNote}>Vista previa · se guardará con tu cuenta (v2)</span>
            </div>
          </div>
        </div>
      </section>

      <section className={`container ${styles.infoGrid}`}>
        <div className={styles.info}>
          <span className="label label-accent">Ubicación</span>
          <span className={styles.muted}>Pendiente de cargar (Etapa 4)</span>
        </div>
        <div className={styles.info}>
          <span className="label label-accent">Disponibilidad</span>
          <span className={styles.muted}>Pendiente de cargar (Etapa 4)</span>
        </div>
        {data.tips.map((t) => (
          <div key={t} className={styles.info}>
            <span className="label label-accent">Consejo</span>
            <span>{t}</span>
          </div>
        ))}
      </section>

      <section className={`container ${styles.ranksSection}`}>
        <h2 className={styles.h2}>Rangos</h2>

        {tracking && (
          <div className={styles.progress}>
            <span className={styles.progressLabel}>
              Tu progreso: <strong>{reached} / {data.maxRank}</strong>
            </span>
            <span className={styles.progressTrack}>
              <span style={{ width: `${(reached / data.maxRank) * 100}%` }} />
            </span>
            <button type="button" className="btn btn--accent" onClick={() => setReached((r) => Math.max(r, sel))}>
              Marcar rango {sel} como alcanzado
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
                {data.textsProvisional ? 'Traducción provisoria · falta texto oficial (España)' : 'Español (España)'}
              </span>
            )}
          </div>

          {rank?.choicesDontMatter ? (
            <div className={styles.dontMatter}>En este rango las respuestas no cambian los puntos: elegí la que quieras.</div>
          ) : rank ? (
            (() => {
              let n = 0;
              return rank.conversations.map((c, i) => (
                <ConversationCard key={i} c={c} index={c.kind === 'phone' ? 0 : ++n} />
              ));
            })()
          ) : (
            <p className="pending">Las respuestas de este rango se cargan en la Etapa 4.</p>
          )}
        </div>

        <aside className={styles.rankSide}>
          <h3 className={styles.h3}>Recompensa del rango</h3>
          {rank && rank.unlocks.length > 0 ? (
            rank.unlocks.map((u) => (
              <div key={u.name} className={styles.reward}>
                <span className={styles.rewardKicker}>Habilidad desbloqueada</span>
                <span className={styles.rewardName}>{u.name}</span>
                <span className={styles.rewardDesc}>{u.description}</span>
              </div>
            ))
          ) : (
            <p className="pending">Se carga en la Etapa 4.</p>
          )}
          <ul className={styles.legend}>
            <li><span style={{ background: 'var(--c-accent)' }} /> Mejor respuesta</li>
            <li><span style={{ background: 'var(--c-royal)' }} /> Exclusivo de Royal</li>
            {data.romance && <li><span style={{ background: 'var(--c-romance)' }} /> Opción de romance</li>}
          </ul>
          <p className={styles.source}>
            Puntos y respuestas: <a href={data.sources[0]}>RPG Site</a>.
          </p>
        </aside>
      </section>
    </article>
  );
}
