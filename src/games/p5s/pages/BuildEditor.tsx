import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/account/AuthContext';
import {
  MAX_SKILLS,
  MAX_STEPS,
  getBuild,
  offered,
  saveBuild,
  type BuildCard,
  type BuildGoal,
  type BuildIngredient,
  type BuildStep,
} from '../../../core/account/builds';
import { authErrorText } from '../../../core/account/supabase';
import { BackButton } from '../../../shared/components/BackButton';
import { getAllPersonas, getPersona } from '../services/personas';
import { bySkillName, personaMatches, personaName, skillName, SKILLS as SKILL_INFO } from '../services/text';
import { personaCardFocus, personaImage } from '../services/images';
import { canInherit, checkStep, fuseResult, isSkillCard, levelNeeds, MAX_INHERIT, personaRequirement, specialIngredients } from '../services/builds';
import { BuildGoalView, BuildRequirements, BuildTimeline } from '../components/BuildTimeline';
import { SkillSearch, type SkillOption } from '../../../shared/components/SkillSearch';
import styles from '../../p3r/pages/BuildEditor.module.css';
import { L } from '../../../i18n';

const ALL_PERSONAS = getAllPersonas()
  .filter((p) => !p.party)
  .sort((a, b) => a.level - b.level);
const SKILLS = Object.keys(SKILL_INFO).sort(bySkillName);
const pname = (id: string) => {
  const p = getPersona(id);
  return p ? personaName(p) : id;
};

const ing = (persona = '', skills: string[] = [], note?: string): BuildIngredient => ({ persona, skills, ...(note ? { note } : {}) });
const emptyStep = (): BuildStep => ({ ingredients: [ing(), ing()], result: '', inherit: [], learn: [] });

/** Crear o editar una build, un paso a la vez. */
export default function BuildEditor() {
  const { buildId } = useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<BuildStep[]>([emptyStep()]);
  const [cards, setCards] = useState<BuildCard[]>([]);
  const [goal, setGoal] = useState<BuildGoal>({ persona: '', skills: Array(8).fill(''), trait: null });
  const [current, setCurrent] = useState(0);
  const [view, setView] = useState<'goal' | 'step' | 'cards' | 'preview'>(buildId ? 'step' : 'goal');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);

  useEffect(() => {
    if (!buildId) return;
    getBuild(buildId).then((b) => {
      if (!b) return;
      setTitle(b.title);
      setDescription(b.description ?? '');
      setSteps(b.steps.length ? b.steps : [emptyStep()]);
      setCards(b.skill_cards);
      if (b.goal) setGoal({ ...b.goal, skills: Array.from({ length: 8 }, (_, i) => (b.goal!.skills[i] === undefined ? '' : b.goal!.skills[i])) });
      setOwner(b.user_id);
    });
  }, [buildId]);

  if (loading) return <div className="container" style={{ paddingBlock: 80 }}>{L('Cargando…', 'Loading…')}</div>;
  if (!user) return <Navigate to="/p5s/cuenta" state={{ from: '/p5s/builds/nueva' }} replace />;
  if (buildId && owner && owner !== user.id) return <Navigate to={`/p5s/builds/${buildId}`} replace />;

  const step = steps[current] ?? steps[0];
  const setStep = (s: BuildStep) => setSteps((list) => list.map((x, j) => (j === current ? s : x)));
  const addStep = () => {
    setSteps([...steps, emptyStep()]);
    setCurrent(steps.length);
    setView('step');
  };
  const removeStep = () => {
    if (steps.length === 1) return setSteps([emptyStep()]);
    setSteps(steps.filter((_, j) => j !== current));
    setCurrent(Math.max(0, current - 1));
  };
  const move = (d: -1 | 1) => {
    const j = current + d;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[current], next[j]] = [next[j], next[current]];
    setSteps(next);
    setCurrent(j);
  };

  const validate = (): string => {
    if (title.trim().length < 3) return L('Ponele un título a la build (mínimo 3 letras).', 'Give the build a title (at least 3 letters).');
    for (const [i, s] of steps.entries()) {
      const c = checkStep(s);
      if (c === 'incomplete') return L(`Completá las Personas del paso ${i + 1}.`, `Fill in the Personas of step ${i + 1}.`);
      if (c === 'bad') return L(`La combinación del paso ${i + 1} no da esa Persona.`, `The combination in step ${i + 1} does not give that Persona.`);
      if (s.inherit.length > MAX_INHERIT) return L(`En el paso ${i + 1} el resultado hereda más de ${MAX_INHERIT} habilidades (en Strikers el máximo es ${MAX_INHERIT}).`, `In step ${i + 1} the result inherits more than ${MAX_INHERIT} skills (Strikers allows ${MAX_INHERIT}).`);
      const blocked = s.inherit.find((k) => !canInherit(s.result, k));
      if (blocked) return L(`En el paso ${i + 1}, ${pname(s.result)} no puede heredar ${skillName(blocked)} por su tipo.`, `In step ${i + 1}, ${pname(s.result)} can't inherit ${skillName(blocked)} because of its type.`);
    }
    if (cards.some((c) => !c.skill)) return L('Completá las skill cards o quitá las que estén vacías.', 'Fill in the skill cards or remove the empty ones.');
    if (!goal.persona) return L('En «Objetivo», elegí la Persona final y cómo tienen que quedar sus habilidades.', 'In «Goal», choose the final Persona and how its skills should end up.');
    return '';
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    if (!profile?.username) return setError(L('Elegí un nombre de usuario en «Mi perfil» antes de publicar.', 'Choose a username in «My profile» before publishing.'));
    setBusy(true);
    const res = await saveBuild(user.id, { id: buildId, title: title.trim(), description: description.trim() || null, steps, skill_cards: cards, goal: goal.persona ? { ...goal, trait: null } : null }, 'p5s');
    setBusy(false);
    if (res.error) return setError(res.error.includes('row-level') ? L('Tu cuenta no puede publicar builds.', 'Your account cannot publish builds.') : authErrorText(res.error));
    navigate(`/p5s/builds/${res.id}`);
  };

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.back}>
        <BackButton fallback={buildId ? `/p5s/builds/${buildId}` : '/p5s/builds'} />
      </div>
      <h1 className={styles.title}>{buildId ? L('Editar build', 'Edit build') : L('Nueva build', 'New build')}</h1>

      <form onSubmit={save} className={styles.form} noValidate>
        <div className={styles.meta}>
          <label className={styles.field}>
            <span className="label label-accent">{L('Título', 'Title')}</span>
            <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder={L('Messiah casi indestructible', 'Nearly indestructible Messiah')} />
          </label>
          <label className={styles.field}>
            <span className="label label-accent">{L('Descripción (opcional)', 'Description (optional)')}</span>
            <textarea value={description} maxLength={2000} rows={2} onChange={(e) => setDescription(e.target.value)} placeholder={L('Para qué sirve, nivel recomendado, consejos…', 'What it is for, recommended level, tips…')} />
          </label>
        </div>

        <nav className={styles.stepper} aria-label={L('Pasos de la build', 'Build steps')}>
          <button type="button" className={`${styles.stepBtn} ${view === 'goal' ? styles.stepOn : ''}`} onClick={() => setView('goal')}>
            <span className={`${styles.dot} ${goal.persona ? styles.dotOk : ''}`}>◆</span> {L('Objetivo', 'Goal')}
          </button>
          {steps.map((s, i) => {
            const c = checkStep(s);
            const on = view === 'step' && i === current;
            return (
              <button key={i} type="button" className={`${styles.stepBtn} ${on ? styles.stepOn : ''}`} onClick={() => { setCurrent(i); setView('step'); }}>
                <span className={`${styles.dot} ${c === 'ok' ? styles.dotOk : c === 'bad' ? styles.dotBad : ''}`}>{c === 'ok' ? '✓' : c === 'bad' ? '!' : i + 1}</span>
                <span>{L('Paso', 'Step')} {i + 1}{s.result ? ` · ${pname(s.result)}` : ''}</span>
              </button>
            );
          })}
          {steps.length < MAX_STEPS && (
            <button type="button" className={styles.stepBtn} onClick={addStep}>
              <span className={styles.dot}>+</span> {L('Nuevo paso', 'New step')}
            </button>
          )}
          <button type="button" className={`${styles.stepBtn} ${view === 'preview' ? styles.stepOn : ''}`} onClick={() => setView('preview')}>
            <span className={styles.dot}>◎</span> {L('Vista previa', 'Preview')}
          </button>
        </nav>

        {view === 'step' && step && (
          <StepPanel
            index={current}
            total={steps.length}
            step={step}
            previous={steps.slice(0, current).map((s, i) => ({ step: s, n: i + 1 })).filter((x) => x.step.result)}
            onChange={setStep}
            onMove={move}
            onRemove={removeStep}
            onNext={current < steps.length - 1 ? () => setCurrent(current + 1) : addStep}
            isLastStep={current === steps.length - 1}
          />
        )}

        {view === 'goal' && <GoalPanel goal={goal} onChange={setGoal} onStart={() => setView('step')} />}

        {view === 'cards' && <CardsPanel cards={cards} onChange={setCards} />}

        {view === 'preview' && (
          <div className={styles.preview}>
            {goal.persona && <BuildGoalView goal={goal} />}
            <BuildRequirements steps={steps} />
            <BuildTimeline steps={steps.filter((s) => checkStep(s) !== 'incomplete')} cards={cards.filter((c) => c.skill)} />
          </div>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <button type="submit" className="btn btn--accent" disabled={busy}>
            {buildId ? L('Guardar cambios', 'Save changes') : L('Publicar build', 'Publish build')}
          </button>
          <Link to={buildId ? `/p5s/builds/${buildId}` : '/p5s/builds'} className={styles.smallBtn}>{L('Cancelar', 'Cancel')}</Link>
        </div>
      </form>
    </section>
  );
}

/* ---------- Un paso ---------- */

interface StepProps {
  index: number;
  total: number;
  step: BuildStep;
  previous: { step: BuildStep; n: number }[];
  onChange: (s: BuildStep) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  onNext: () => void;
  isLastStep: boolean;
}

function StepPanel({ index, total, step, previous, onChange, onMove, onRemove, onNext, isLastStep }: StepProps) {
  const [picking, setPicking] = useState<number | 'result' | null>(null);
  const check = checkStep(step);
  const fromStep = (id: string) => previous.filter((p) => p.step.result === id).pop();
  const carried = (id: string) => {
    const p = fromStep(id);
    return p ? [...p.step.inherit, ...p.step.learn.map((l) => l.skill)] : [];
  };

  const updateIngredients = (ingredients: BuildIngredient[]) => {
    const prevOffer = offered(step);
    const nextOffer = [...new Set(ingredients.flatMap((x) => x.skills))];
    const inherit = [...step.inherit.filter((s) => nextOffer.includes(s)), ...nextOffer.filter((s) => !prevOffer.includes(s) && canInherit(step.result, s))].slice(0, MAX_INHERIT);
    onChange({ ...step, ingredients, inherit });
  };
  const setIng = (j: number, v: BuildIngredient) => updateIngredients(step.ingredients.map((x, k) => (k === j ? v : x)));

  const pick = (id: string) => {
    if (picking === 'result') {
      const special = specialIngredients(id);
      if (special && special.length > 2) {
        const byId = new Map(step.ingredients.map((x) => [x.persona, x]));
        onChange({ ...step, result: id, learn: [], ingredients: special.map((pid) => byId.get(pid) ?? ing(pid, carried(pid))) });
      } else onChange({ ...step, result: id, learn: [] });
    } else if (typeof picking === 'number') {
      setIng(picking, ing(id, carried(id)));
    }
    setPicking(null);
  };
  const useCreated = (id: string) => {
    const j = step.ingredients.findIndex((x) => !x.persona);
    const at = j >= 0 ? j : step.ingredients.length;
    const list = [...step.ingredients];
    list[at] = ing(id, carried(id));
    updateIngredients(list);
  };

  const real = step.ingredients.length === 2 && step.ingredients.every((x) => x.persona) ? fuseResult(step.ingredients[0].persona, step.ingredients[1].persona) : null;
  const sources = (skill: string) => step.ingredients.filter((x) => x.skills.includes(skill)).map((x) => pname(x.persona));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2 className={styles.h2}>{L('Paso', 'Step')} {index + 1}</h2>
        <p className={styles.howto}>
          <span>1</span> {L('Elegí las Personas tocando los cuadros', 'Choose the Personas by tapping the boxes')} <span>2</span>{' '}
          {L('Tocá las habilidades que pasan al resultado', 'Tap the skills that pass to the result')} <span>3</span>{' '}
          {L('Explicá el paso con tus palabras', 'Explain the step in your own words')}
        </p>
      </div>

      <div className={styles.board}>
        {step.ingredients.map((x, j) => (
          <Fragment key={j}>
            {j > 0 && <span className={styles.op}>+</span>}
            <Slot
              personaId={x.persona}
              label={`${L('Ingrediente', 'Ingredient')} ${j + 1}`}
              tag={fromStep(x.persona) ? `${L('Del paso', 'From step')} ${fromStep(x.persona)!.n}` : undefined}
              onPick={() => setPicking(j)}
              onClear={step.ingredients.length > 2 ? () => updateIngredients(step.ingredients.filter((_, k) => k !== j)) : undefined}
            >
              {x.persona && (
                <SkillToggles
                  personaId={x.persona}
                  carried={carried(x.persona)}
                  value={x.skills}
                  onChange={(skills, note) => setIng(j, { ...x, skills, ...(note !== undefined ? { note: note || undefined } : {}) })}
                />
              )}
              {x.persona && (
                <input className={styles.slotNote} value={x.note ?? ''} maxLength={120} onChange={(e) => setIng(j, { ...x, note: e.target.value || undefined })} placeholder={L('Nota corta (opcional)', 'Short note (optional)')} />
              )}
            </Slot>
          </Fragment>
        ))}
        {step.ingredients.length < 6 && (
          <button type="button" className={styles.addIng} onClick={() => updateIngredients([...step.ingredients, ing()])} title={L('Agregar ingrediente (fusión avanzada)', 'Add ingredient (advanced fusion)')}>
            {L('+ ingrediente', '+ ingredient')}
          </button>
        )}
        <span className={styles.op}>=</span>
        <Slot personaId={step.result} label={L('Resultado', 'Result')} result onPick={() => setPicking('result')}>
          {step.result && (
            <>
              {offered(step).length > 0 && <span className={styles.mini}>{L(`Hereda, hasta ${MAX_INHERIT} (tocá para quitar; las tachadas no las puede heredar):`, `Inherits, up to ${MAX_INHERIT} (tap to remove; crossed out ones can't be inherited):`)}</span>}
              <div className={styles.chips}>
                {offered(step).map((s) => {
                  const on = step.inherit.includes(s);
                  const ok = canInherit(step.result, s);
                  const full = !on && step.inherit.length >= MAX_INHERIT;
                  return (
                    <button key={s} type="button" disabled={!ok || full} title={!ok ? L('No la puede heredar por su tipo', "Can't inherit it because of its type") : full ? L(`Máximo ${MAX_INHERIT} habilidades heredadas`, `Up to ${MAX_INHERIT} inherited skills`) : undefined}
                      className={`${styles.chip} ${on ? styles.chipOn : styles.chipOff}`} style={!ok ? { textDecoration: 'line-through', opacity: 0.5 } : undefined}
                      onClick={() => onChange({ ...step, inherit: on ? step.inherit.filter((x) => x !== s) : [...step.inherit, s] })}>
                      {skillName(s)} <small>← {sources(s).join(', ')}</small>
                    </button>
                  );
                })}
              </div>
              <span className={styles.mini}>{L('Aprende sola (tocá para marcar):', 'Learns by itself (tap to mark):')}</span>
              <div className={styles.chips}>
                {(getPersona(step.result)?.skills ?? []).map((s) => {
                  const on = step.learn.some((l) => l.skill === s.skill);
                  return (
                    <button key={s.skill} type="button" className={`${styles.chip} ${on ? styles.chipLearn : styles.chipOff}`} onClick={() => onChange({ ...step, learn: on ? step.learn.filter((l) => l.skill !== s.skill) : [...step.learn, { skill: s.skill, level: s.level }] })}>
                      {s.level ? `${L('Nv', 'Lv')} ${s.level}` : L('Base', 'Innate')} · {skillName(s.skill)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Slot>
      </div>

      {check === 'ok' && <p className={styles.ok}>✓ {L('Combinación correcta en Strikers', 'Correct combination in Strikers')}</p>}
      {check === 'ok' && levelNeeds(step).map((n) => (
        <p key={n.persona} className={styles.mini}>⚠ {L(`Subí ${pname(n.persona)} al Nv ${n.level} o más antes de fusionar.`, `Raise ${pname(n.persona)} to Lv ${n.level} or higher before fusing.`)}</p>
      ))}
      {check === 'bad' && (
        <p className={styles.bad}>
          ✗ {L('Esta combinación no da', 'This combination does not give')} {pname(step.result)}.
          {real ? ` ${step.ingredients.map((x) => pname(x.persona)).join(' + ')} ${L('da', 'gives')} ${pname(real)}.` : ''}
          {real && (
            <button type="button" className={styles.fix} onClick={() => onChange({ ...step, result: real, learn: [] })}>
              {L('Usar', 'Use')} {pname(real)}
            </button>
          )}
        </p>
      )}

      {previous.length > 0 && (
        <div className={styles.created}>
          <span className={styles.mini}>{L('Usar una Persona que ya creaste:', 'Use a Persona you already created:')}</span>
          <div className={styles.chips}>
            {previous.map((p) => (
              <button key={p.n} type="button" className={styles.createdBtn} onClick={() => useCreated(p.step.result)}>
                {personaImage(p.step.result, 'side') && <img src={personaImage(p.step.result, 'side')} alt="" style={{ objectPosition: personaCardFocus(p.step.result) }} />}
                {L('Paso', 'Step')} {p.n} · {pname(p.step.result)}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className={styles.field}>
        <span className="label label-accent">{L('Explicación del paso', 'Step explanation')}</span>
        <textarea
          rows={3}
          maxLength={600}
          value={step.note ?? ''}
          onChange={(e) => onChange({ ...step, note: e.target.value || undefined })}
          placeholder={L('Contá con tus palabras qué hacer en este paso o qué hay que tener en cuenta.', 'Explain in your own words what to do in this step or what to keep in mind.')}
        />
      </label>

      <div className={styles.tools}>
        <button type="button" className={styles.smallBtn} onClick={() => onMove(-1)} disabled={index === 0}>{L('← Mover antes', '← Move earlier')}</button>
        <button type="button" className={styles.smallBtn} onClick={() => onMove(1)} disabled={index === total - 1}>{L('Mover después →', 'Move later →')}</button>
        <button type="button" className={styles.smallBtn} onClick={onRemove}>{L('Borrar paso', 'Delete step')}</button>
        <button type="button" className="btn btn--light" onClick={onNext}>
          {isLastStep ? L('+ Siguiente paso', '+ Next step') : L('Ir al paso siguiente →', 'Go to next step →')}
        </button>
      </div>

      {picking !== null && (
        <PersonaPicker
          title={picking === 'result' ? L('¿Qué Persona querés crear?', 'Which Persona do you want to create?') : L('Elegí un ingrediente', 'Choose an ingredient')}
          created={previous.map((p) => p.step.result)}
          onPick={pick}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}

/* ---------- Cuadro de una Persona ---------- */

function Slot({ personaId, label, tag, result, onPick, onClear, children }: { personaId: string; label: string; tag?: string; result?: boolean; onPick: () => void; onClear?: () => void; children?: React.ReactNode }) {
  const p = getPersona(personaId);
  const img = personaImage(personaId, 'side');
  const req = p ? personaRequirement(p) : null;
  return (
    <div className={`${styles.slot} ${result ? styles.slotResult : ''}`}>
      <button type="button" className={styles.slotPick} onClick={onPick} title={p ? L('Cambiar Persona', 'Change Persona') : L('Elegir Persona', 'Choose Persona')}>
        {p ? (
          img ? <img src={img} alt="" style={{ objectPosition: personaCardFocus(personaId) }} /> : <span className={styles.slotEmpty}>{L('Sin foto', 'No photo')}</span>
        ) : (
          <span className={styles.slotEmpty}>{L('+ Elegir', '+ Choose')}<br />{label.toLowerCase()}</span>
        )}
        {tag && <span className={styles.tag}>{tag}</span>}
        {req && <span className={styles.req}>{req.kind === 'story' ? L('Historia', 'Story') : req.text}</span>}
      </button>
      <div className={styles.slotName}>
        {p ? (
          <>
            <Link to={`/p5s/calculadora/persona/${personaId}`} target="_blank" title={L('Ver perfil (se abre aparte)', 'See profile (opens separately)')}>{personaName(p)}</Link>
            <small>{L('Nv', 'Lv')} {p.level}</small>
          </>
        ) : (
          <span className={styles.mini}>{label}</span>
        )}
        {onClear && (
          <button type="button" className={styles.clear} onClick={onClear} aria-label={L('Quitar ingrediente', 'Remove ingredient')}>×</button>
        )}
      </div>
      {children}
    </div>
  );
}

/** Habilidades de una Persona para marcar cuáles pasa. Si se marca una que aprende subiendo de nivel, escribe la nota sola. */
function SkillToggles({ personaId, carried, value, onChange }: { personaId: string; carried: string[]; value: string[]; onChange: (v: string[], note?: string) => void }) {
  const p = getPersona(personaId);
  const own = p?.skills ?? [];
  const extra = value.filter((s) => !carried.includes(s) && !own.some((o) => o.skill === s));
  const toggle = (s: string) => {
    const on = value.includes(s);
    const next = on ? value.filter((x) => x !== s) : [...value, s].slice(0, MAX_SKILLS);
    // Nota automática con el nivel más alto que hace falta
    const lv = Math.max(0, ...next.map((k) => own.find((o) => o.skill === k)?.level ?? 0));
    const learnt = next.filter((k) => (own.find((o) => o.skill === k)?.level ?? 0) === lv && lv > 0);
    onChange(next, lv > (p?.level ?? 0) ? L(`Subila al Nv ${lv} para que aprenda ${learnt.map(skillName).join(' y ')}`, `Level it to ${lv} so it learns ${learnt.map(skillName).join(' and ')}`) : '');
  };
  return (
    <div className={styles.toggles}>
      {carried.length > 0 && <span className={styles.mini}>{L('Trae heredadas:', 'Already inherited:')}</span>}
      <div className={styles.chips}>
        {carried.map((s) => (
          <button key={`c-${s}`} type="button" className={`${styles.chip} ${value.includes(s) ? styles.chipOn : styles.chipOff}`} onClick={() => toggle(s)}>
            {skillName(s)}
          </button>
        ))}
      </div>
      <span className={styles.mini}>{L('Sus habilidades:', 'Its skills:')}</span>
      <div className={styles.chips}>
        {own.filter((o) => !carried.includes(o.skill)).map((o) => (
          <button key={o.skill} type="button" className={`${styles.chip} ${value.includes(o.skill) ? styles.chipOn : styles.chipOff}`} onClick={() => toggle(o.skill)} title={o.level ? L(`La aprende al Nv ${o.level}`, `Learned at Lv ${o.level}`) : L('La trae de base', 'Innate')}>
            {o.level ? <small>{L('Nv', 'Lv')} {o.level}</small> : null} {skillName(o.skill)}
          </button>
        ))}
        {extra.map((s) => (
          <button key={`e-${s}`} type="button" className={`${styles.chip} ${styles.chipOn}`} onClick={() => toggle(s)}>
            {skillName(s)}
          </button>
        ))}
      </div>
      <div className={styles.addSkill}>
        <SkillSearch options={skillOptions(SKILLS)} keepText={false} onChange={(k) => { if (k && !value.includes(k)) onChange([...value, k]); }} placeholder={L('Otra habilidad… (buscá por cualquier palabra)', 'Another skill… (search any word)')} />
      </div>
    </div>
  );
}

/* ---------- Buscador de Personas con foto ---------- */

function PersonaPicker({ title, created, onPick, onClose }: { title: string; created: string[]; onPick: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const list = useMemo(() => (q.trim() ? ALL_PERSONAS.filter((p) => personaMatches(p, q)) : ALL_PERSONAS), [q]);
  const createdSet = [...new Set(created)];
  return (
    <div className={styles.modalBg} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.modalHead}>
          <h3>{title}</h3>
          <button type="button" className={styles.clear} onClick={onClose} aria-label={L('Cerrar', 'Close')}>×</button>
        </div>
        <input autoFocus className={styles.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Buscar por nombre…', 'Search by name…')} />
        {createdSet.length > 0 && !q && (
          <>
            <span className={styles.mini}>{L('Creadas en pasos anteriores', 'Created in earlier steps')}</span>
            <div className={styles.grid}>{createdSet.map((id) => <PickCard key={`c-${id}`} id={id} onPick={onPick} />)}</div>
            <span className={styles.mini}>{L('Todas', 'All')}</span>
          </>
        )}
        <div className={styles.grid}>
          {list.slice(0, 120).map((p) => <PickCard key={p.id} id={p.id} onPick={onPick} />)}
        </div>
        {list.length > 120 && <p className={styles.mini}>{L('Escribí para encontrar más…', 'Type to find more…')}</p>}
      </div>
    </div>
  );
}

function PickCard({ id, onPick }: { id: string; onPick: (id: string) => void }) {
  const p = getPersona(id)!;
  const img = personaImage(id, 'side');
  return (
    <button type="button" className={styles.pick} onClick={() => onPick(id)}>
      {img ? <img src={img} alt="" loading="lazy" style={{ objectPosition: personaCardFocus(id) }} /> : <span className={styles.pickEmpty} />}
      <span>{personaName(p)}</span>
      <small>{L('Nv', 'Lv')} {p.level}</small>
    </button>
  );
}

/* ---------- Objetivo: cómo queda la Persona final ---------- */

function GoalPanel({ goal, onChange, onStart }: { goal: BuildGoal; onChange: (g: BuildGoal) => void; onStart: () => void }) {
  const [picking, setPicking] = useState(false);
  const setSkill = (i: number, v: string | null) => onChange({ ...goal, skills: goal.skills.map((x, j) => (j === i ? v : x)) });
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2 className={styles.h2}>{L('Objetivo', 'Goal')}</h2>
        <p className={styles.howto}>{L('Mostrá cómo tienen que quedar las 8 habilidades de la Persona final. Si alguna queda a gusto de cada jugador, marcala como «A elección».', 'Show how the 8 skills of the final Persona should end up. If any is up to each player, mark it as «Choice».')}</p>
      </div>
      <div className={styles.goalEdit}>
        <Slot personaId={goal.persona} label={L('Persona final', 'Final Persona')} result onPick={() => setPicking(true)} />
        <div className={styles.goalSlots}>
          {goal.skills.map((s, i) => (
            <div key={i} className={styles.goalSlot}>
              <span className={styles.goalNum}>{i + 1}</span>
              {s === null ? (
                <span className={styles.goalFreeTxt}>{L('A elección del jugador', "Player's choice")}</span>
              ) : (
                <SkillInput key={`${i}-${s}`} value={s} onChange={(v) => setSkill(i, v)} />
              )}
              <button type="button" className={`${styles.chip} ${s === null ? styles.chipOn : styles.chipOff}`} onClick={() => setSkill(i, s === null ? '' : null)}>
                {L('A elección', 'Choice')}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.tools}>
        <button type="button" className="btn btn--light" onClick={onStart}>{L('Empezar con el paso 1 →', 'Start with step 1 →')}</button>
      </div>
      {picking && (
        <PersonaPicker
          title={L('¿Qué Persona querés armar?', 'Which Persona do you want to build?')}
          created={[]}
          onPick={(persona) => {
            onChange({ ...goal, persona, trait: null });
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  );
}

/* ---------- Skill cards ---------- */

function CardsPanel({ cards, onChange }: { cards: BuildCard[]; onChange: (c: BuildCard[]) => void }) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.h2}>{L('Skill cards del toque final', 'Finishing skill cards')}</h2>
      <p className={styles.howto}>{L('En el Golden las skill cards salen del Shuffle Time, de cofres y de la Cafetería Chagall. Elegí cuáles hay que enseñarle a la Persona final.', 'In Golden skill cards come from Shuffle Time, chests and Cafe Chagall. Choose which ones to teach the final Persona.')}</p>
      {cards.map((c, k) => (
        <div key={k} className={styles.cardRow}>
          <div className={styles.field} style={{ minWidth: 260 }}>
            <span className={styles.mini}>Skill card</span>
            <SkillInput value={c.skill} onChange={(v) => onChange(cards.map((x, j) => (j === k ? { skill: v, from: '' } : x)))} onlyCards />
            {c.skill && !isSkillCard(c.skill) && <span className={styles.bad}>{L('Esta habilidad no existe como skill card.', 'This skill does not exist as a skill card.')}</span>}
          </div>
          <button type="button" className={styles.smallBtn} onClick={() => onChange(cards.filter((_, j) => j !== k))}>{L('Quitar', 'Remove')}</button>
        </div>
      ))}
      {cards.length < 8 && (
        <button type="button" className="btn btn--light" onClick={() => onChange([...cards, { skill: '', from: '' }])}>{L('+ Agregar skill card', '+ Add skill card')}</button>
      )}
    </div>
  );
}

const CARD_SKILLS = SKILLS.filter(isSkillCard);

function SkillInput({ value, onChange, onlyCards }: { value: string; onChange: (v: string) => void; onlyCards?: boolean }) {
  return <SkillSearch options={skillOptions(onlyCards ? CARD_SKILLS : SKILLS)} value={value} onChange={onChange} placeholder={L('Escribí una habilidad', 'Type a skill')} />;
}

const optionCache = new Map<string[], SkillOption[]>();
function skillOptions(list: string[]): SkillOption[] {
  let o = optionCache.get(list);
  if (!o) {
    o = list.map((k) => ({ key: k, label: skillName(k), alt: k }));
    optionCache.set(list, o);
  }
  return o;
}
