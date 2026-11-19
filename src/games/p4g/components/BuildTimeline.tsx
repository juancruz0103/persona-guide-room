import { Fragment, useState } from 'react';
import type { BuildCard, BuildGoal, BuildStep } from '../../../core/account/builds';
import { personaCardFocus, personaImage } from '../services/images';
import { Link } from 'react-router-dom';
import { BuildPersona } from './BuildPersona';
import { buildRequirements, checkStep } from '../services/builds';
import { getPersona } from '../services/personas';
import { personaName, skillName } from '../services/text';
import styles from '../../p3r/components/BuildTimeline.module.css';
import { L } from '../../../i18n';

/** Requisitos detectados solos a partir de las Personas de la build. */
export function BuildRequirements({ steps }: { steps: BuildStep[]; cards?: BuildCard[] }) {
  const [showStory, setShowStory] = useState(false);
  const ids = [...steps.flatMap((s) => [...s.ingredients.map((i) => i.persona), s.result]), ].filter(Boolean);
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
      <span className={styles.reqTitle}>{L('Requisitos', 'Requirements')}</span>
      {conf.length > 0 && (
        <div className={styles.reqGroup}>
          <span className={styles.reqLabel}>{L('Vínculos al máximo', 'Maxed Social Links')}</span>
          <div className={styles.reqChips}>
            {conf.map((r) => (
              <span key={r.text} className={styles.reqConf} title={`${L('Para', 'For')}: ${r.personas.map(name).join(', ')}`}>
                {r.text.replace(/ (rango|rank) \d+$/, '')} <small>({r.personas.map(name).join(', ')})</small>
              </span>
            ))}
          </div>
        </div>
      )}
      {dlc.length > 0 && (
        <div className={styles.reqGroup}>
          <span className={styles.reqLabel}>{L('Contenido descargable', 'Downloadable content')}</span>
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
          <span className={styles.reqLabel}>{L('Avance de la historia', 'Story progress')}</span>
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
              {L('Mostrar (spoiler)', 'Show (spoiler)')}
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
                {isLast ? L('Fusión final', 'Final fusion') : `${L('Paso', 'Step')} ${i + 1}`}
                {s.ingredients.length > 2 && <span className={styles.kind}> · {L('Fusión avanzada', 'Advanced fusion')}</span>}
              </span>
              {check === 'ok' && <span className={styles.ok}>✓ {L('Combinación verificada', 'Verified combination')}</span>}
              {check === 'bad' && <span className={styles.bad}>✗ {L('Esta combinación no da ese resultado', 'This combination does not give that result')}</span>}
            </div>
            <div className={styles.row}>
              {s.ingredients.map((ing, j) => (
                <Fragment key={j}>
                  {j > 0 && <span className={styles.plus}>+</span>}
                  <BuildPersona personaId={ing.persona} skills={ing.skills} note={ing.note} fromStep={resultStep.get(ing.persona)} />
                </Fragment>
              ))}
              <span className={styles.arrow}>➜</span>
              {!isLast && <BuildPersona personaId={s.result} skills={s.inherit} learn={s.learn} trait={s.trait} variant="result" />}
              {isLast && <span className={styles.finalHint}>{L('Persona final ↓', 'Final Persona ↓')}</span>}
            </div>
            {s.note && <p className={styles.note}>{s.note}</p>}
          </div>
        );
        resultStep.set(s.result, i + 1);
        return <Fragment key={i}>{view}</Fragment>;
      })}

      {last && (
        <div className={styles.finale}>
          <BuildPersona personaId={last.result} skills={last.inherit} learn={last.learn} trait={last.trait} variant="final" />
          {cards.length > 0 && (
            <div className={styles.cards}>
              <span className={styles.cardsTitle}>{L('Skill cards que hay que enseñarle', 'Skill cards to teach it')}</span>
              {cards.map((c, k) => (
                <div key={k} className={styles.cardRow}>
                  <span className={styles.cardArrow}>⬅</span>
                  <span className={styles.skillCard}>{skillName(c.skill)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** «Así tiene que quedar»: la Persona final con sus 8 habilidades. */
export function BuildGoalView({ goal }: { goal: BuildGoal }) {
  const p = getPersona(goal.persona);
  const img = personaImage(goal.persona, 'profile') ?? personaImage(goal.persona, 'side');
  const slots = Array.from({ length: 8 }, (_, i) => goal.skills[i]);
  return (
    <div className={styles.goal}>
      <Link to={`/p4g/calculadora/persona/${goal.persona}`} className={styles.goalImg} title={L('Ver perfil', 'See profile')}>
        {img && <img loading="lazy" decoding="async" src={img} alt="" style={{ objectPosition: personaCardFocus(goal.persona) }} />}
        <span>{p ? personaName(p) : goal.persona}</span>
      </Link>
      <div className={styles.goalBody}>
        <span className={styles.goalTitle}>{L('Así tiene que quedar', 'How it should end up')}</span>
        <ol className={styles.goalSkills}>
          {slots.map((s, i) => (
            <li key={i} className={s === null ? styles.goalFree : s ? undefined : styles.goalEmpty}>
              <span>{i + 1}</span>
              {s === null ? L('A elección del jugador', "Player's choice") : s ? skillName(s) : '—'}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
