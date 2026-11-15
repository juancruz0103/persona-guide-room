import { Fragment, useState } from 'react';
import type { BuildCard, BuildStep } from '../../../core/account/builds';
import { BuildPersona } from './BuildPersona';
import { buildRequirements, checkStep } from '../services/builds';
import { getPersona } from '../services/personas';
import { personaName, skillName } from '../services/gameText';
import styles from './BuildTimeline.module.css';

/** Requisitos detectados solos a partir de las Personas de la build. */
export function BuildRequirements({ steps, cards }: { steps: BuildStep[]; cards: BuildCard[] }) {
  const [showStory, setShowStory] = useState(false);
  const ids = [...steps.flatMap((s) => [...s.ingredients.map((i) => i.persona), s.result]), ...cards.map((c) => c.from)].filter(Boolean);
  const reqs = buildRequirements(ids);
  if (!reqs.length) return null;
  const name = (id: string) => {
    const p = getPersona(id);
    return p ? personaName(p) : id;
  };
  const conf = reqs.filter((r) => r.kind === 'confidant');
  const dlc = reqs.filter((r) => r.kind === 'dlc');
  const story = reqs.filter((r) => r.kind === 'story');
  return (
    <div className={styles.reqs}>
      <span className={styles.reqTitle}>Requisitos</span>
      {conf.length > 0 && (
        <div className={styles.reqGroup}>
          <span className={styles.reqLabel}>Confidentes al máximo</span>
          <div className={styles.reqChips}>
            {conf.map((r) => (
              <span key={r.text} className={styles.reqConf} title={`Para: ${r.personas.map(name).join(', ')}`}>
                {r.text.replace(/ rango \d+$/, '')} <small>({r.personas.map(name).join(', ')})</small>
              </span>
            ))}
          </div>
        </div>
      )}
      {dlc.length > 0 && (
        <div className={styles.reqGroup}>
          <span className={styles.reqLabel}>Contenido descargable</span>
          <div className={styles.reqChips}>
            {dlc.map((r) => (
              <span key={r.text} className={styles.reqDlc}>
                {r.text} <small>({r.personas.map(name).join(', ')})</small>
              </span>
            ))}
          </div>
        </div>
      )}
      {story.length > 0 && (
        <div className={styles.reqGroup}>
          <span className={styles.reqLabel}>Avance de la historia</span>
          {showStory ? (
            <div className={styles.reqChips}>
              {story.map((r) => (
                <span key={r.text} className={styles.reqStory}>
                  {r.text} <small>({r.personas.map(name).join(', ')})</small>
                </span>
              ))}
            </div>
          ) : (
            <button type="button" className={styles.spoilerBtn} onClick={() => setShowStory(true)}>
              Mostrar (spoiler)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** La ruta de fusiones paso a paso, con la Persona final y las skill cards. */
export function BuildTimeline({ steps, cards }: { steps: BuildStep[]; cards: BuildCard[] }) {
  const resultStep = new Map<string, number>();
  const last = steps[steps.length - 1];
  return (
    <div className={styles.timeline}>
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const check = checkStep(s);
        const view = (
          <div className={`${styles.step} ${isLast ? styles.stepFinal : ''}`}>
            <div className={styles.stepHead}>
              <span className={styles.num}>{i + 1}</span>
              <span className={styles.stepTitle}>
                {isLast ? 'Fusión final' : `Paso ${i + 1}`}
                {s.ingredients.length > 2 && <span className={styles.kind}> · Fusión avanzada</span>}
              </span>
              {check === 'ok' && <span className={styles.ok}>✓ Combinación verificada</span>}
              {check === 'bad' && <span className={styles.bad}>✗ Esta combinación no da ese resultado</span>}
            </div>
            {s.note && <p className={styles.note}>{s.note}</p>}
            <div className={styles.row}>
              {s.ingredients.map((ing, j) => (
                <Fragment key={j}>
                  {j > 0 && <span className={styles.plus}>+</span>}
                  <BuildPersona personaId={ing.persona} skills={ing.skills} note={ing.note} fromStep={resultStep.get(ing.persona)} />
                </Fragment>
              ))}
              <span className={styles.arrow}>➜</span>
              {!isLast && <BuildPersona personaId={s.result} skills={s.inherit} learn={s.learn} variant="result" />}
              {isLast && <span className={styles.finalHint}>Persona final ↓</span>}
            </div>
          </div>
        );
        resultStep.set(s.result, i + 1);
        return <Fragment key={i}>{view}</Fragment>;
      })}

      {last && (
        <div className={styles.finale}>
          <BuildPersona personaId={last.result} skills={last.inherit} learn={last.learn} variant="final" />
          {cards.length > 0 && (
            <div className={styles.cards}>
              <span className={styles.cardsTitle}>Skill cards · silla eléctrica</span>
              {cards.map((c, k) => (
                <div key={k} className={styles.cardRow}>
                  <span className={styles.cardArrow}>⬅</span>
                  <span className={styles.skillCard}>{skillName(c.skill)}</span>
                  <span className={styles.cardFrom}>de</span>
                  <BuildPersona personaId={c.from} variant="mini" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
