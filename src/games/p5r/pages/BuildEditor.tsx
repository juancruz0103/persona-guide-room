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
  type BuildIngredient,
  type BuildStep,
} from '../../../core/account/builds';
import { authErrorText } from '../../../core/account/supabase';
import { BackButton } from '../../../shared/components/BackButton';
import { getAllPersonas, getAllSkills, getPersona } from '../services/personas';
import { bySkillName, personaMatches, personaName, skillName } from '../services/gameText';
import { personaCardFocus, personaImage } from '../services/images';
import { checkStep, fuseResult, personaRequirement, specialIngredients } from '../services/builds';
import { BuildRequirements, BuildTimeline } from '../components/BuildTimeline';
import styles from './BuildEditor.module.css';

const ALL_PERSONAS = getAllPersonas()
  .filter((p) => !p.party)
  .sort((a, b) => a.level - b.level);
const SKILLS = getAllSkills()
  .map((s) => s.name)
  .sort(bySkillName);
const findSkill = (text: string) => {
  const t = text.trim().toLowerCase();
  return SKILLS.find((k) => skillName(k).toLowerCase() === t || k.toLowerCase() === t);
};
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
  const [current, setCurrent] = useState(0);
  const [view, setView] = useState<'step' | 'cards' | 'preview'>('step');
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
      setOwner(b.user_id);
    });
  }, [buildId]);

  if (loading) return <div className="container" style={{ paddingBlock: 80 }}>Cargando…</div>;
  if (!user) return <Navigate to="/p5r/cuenta" state={{ from: '/p5r/builds/nueva' }} replace />;
  if (buildId && owner && owner !== user.id) return <Navigate to={`/p5r/builds/${buildId}`} replace />;

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
    if (title.trim().length < 3) return 'Ponele un título a la build (mínimo 3 letras).';
    for (const [i, s] of steps.entries()) {
      const c = checkStep(s);
      if (c === 'incomplete') return `Completá las Personas del paso ${i + 1}.`;
      if (c === 'bad') return `La combinación del paso ${i + 1} no da esa Persona.`;
      if (s.inherit.length > MAX_SKILLS) return `En el paso ${i + 1} el resultado hereda más de ${MAX_SKILLS} habilidades.`;
    }
    if (cards.some((c) => !c.skill || !c.from)) return 'Completá las skill cards o quitá las que estén vacías.';
    return '';
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    if (!profile?.username) return setError('Elegí un nombre de usuario en «Mi perfil» antes de publicar.');
    setBusy(true);
    const res = await saveBuild(user.id, { id: buildId, title: title.trim(), description: description.trim() || null, steps, skill_cards: cards });
    setBusy(false);
    if (res.error) return setError(res.error.includes('row-level') ? 'Tu cuenta no puede publicar builds.' : authErrorText(res.error));
    navigate(`/p5r/builds/${res.id}`);
  };

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.back}>
        <BackButton fallback={buildId ? `/p5r/builds/${buildId}` : '/p5r/builds'} />
      </div>
      <h1 className={styles.title}>{buildId ? 'Editar build' : 'Nueva build'}</h1>

      <form onSubmit={save} className={styles.form} noValidate>
        <div className={styles.meta}>
          <label className={styles.field}>
            <span className="label label-accent">Título</span>
            <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Yoshitsune casi indestructible" />
          </label>
          <label className={styles.field}>
            <span className="label label-accent">Descripción (opcional)</span>
            <textarea value={description} maxLength={2000} rows={2} onChange={(e) => setDescription(e.target.value)} placeholder="Para qué sirve, nivel recomendado, consejos…" />
          </label>
        </div>

        <nav className={styles.stepper} aria-label="Pasos de la build">
          {steps.map((s, i) => {
            const c = checkStep(s);
            const on = view === 'step' && i === current;
            return (
              <button key={i} type="button" className={`${styles.stepBtn} ${on ? styles.stepOn : ''}`} onClick={() => { setCurrent(i); setView('step'); }}>
                <span className={`${styles.dot} ${c === 'ok' ? styles.dotOk : c === 'bad' ? styles.dotBad : ''}`}>{c === 'ok' ? '✓' : c === 'bad' ? '!' : i + 1}</span>
                <span>Paso {i + 1}{s.result ? ` · ${pname(s.result)}` : ''}</span>
              </button>
            );
          })}
          {steps.length < MAX_STEPS && (
            <button type="button" className={styles.stepBtn} onClick={addStep}>
              <span className={styles.dot}>+</span> Nuevo paso
            </button>
          )}
          <button type="button" className={`${styles.stepBtn} ${view === 'cards' ? styles.stepOn : ''}`} onClick={() => setView('cards')}>
            <span className={styles.dot}>★</span> Skill cards
          </button>
          <button type="button" className={`${styles.stepBtn} ${view === 'preview' ? styles.stepOn : ''}`} onClick={() => setView('preview')}>
            <span className={styles.dot}>◎</span> Vista previa
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

        {view === 'cards' && <CardsPanel cards={cards} onChange={setCards} />}

        {view === 'preview' && (
          <div className={styles.preview}>
            <BuildRequirements steps={steps} cards={cards.filter((c) => c.skill && c.from)} />
            <BuildTimeline steps={steps.filter((s) => checkStep(s) !== 'incomplete')} cards={cards.filter((c) => c.skill && c.from)} />
          </div>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <button type="submit" className="btn btn--accent" disabled={busy}>
            {buildId ? 'Guardar cambios' : 'Publicar build'}
          </button>
          <Link to={buildId ? `/p5r/builds/${buildId}` : '/p5r/builds'} className={styles.smallBtn}>Cancelar</Link>
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
    const inherit = [...step.inherit.filter((s) => nextOffer.includes(s)), ...nextOffer.filter((s) => !prevOffer.includes(s))];
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
        <h2 className={styles.h2}>Paso {index + 1}</h2>
        <p className={styles.howto}>
          <span>1</span> Elegí las Personas tocando los cuadros <span>2</span> Tocá las habilidades que pasan al resultado{' '}
          <span>3</span> Explicá el paso con tus palabras
        </p>
      </div>

      <div className={styles.board}>
        {step.ingredients.map((x, j) => (
          <Fragment key={j}>
            {j > 0 && <span className={styles.op}>+</span>}
            <Slot
              personaId={x.persona}
              label={`Ingrediente ${j + 1}`}
              tag={fromStep(x.persona) ? `Del paso ${fromStep(x.persona)!.n}` : undefined}
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
                <input className={styles.slotNote} value={x.note ?? ''} maxLength={120} onChange={(e) => setIng(j, { ...x, note: e.target.value || undefined })} placeholder="Nota corta (opcional)" />
              )}
            </Slot>
          </Fragment>
        ))}
        {step.ingredients.length < 6 && (
          <button type="button" className={styles.addIng} onClick={() => updateIngredients([...step.ingredients, ing()])} title="Agregar ingrediente (fusión avanzada)">
            + ingrediente
          </button>
        )}
        <span className={styles.op}>=</span>
        <Slot personaId={step.result} label="Resultado" result onPick={() => setPicking('result')}>
          {step.result && (
            <>
              {offered(step).length > 0 && <span className={styles.mini}>Hereda (tocá para quitar):</span>}
              <div className={styles.chips}>
                {offered(step).map((s) => {
                  const on = step.inherit.includes(s);
                  return (
                    <button key={s} type="button" className={`${styles.chip} ${on ? styles.chipOn : styles.chipOff}`} onClick={() => onChange({ ...step, inherit: on ? step.inherit.filter((x) => x !== s) : [...step.inherit, s] })}>
                      {skillName(s)} <small>← {sources(s).join(', ')}</small>
                    </button>
                  );
                })}
              </div>
              <span className={styles.mini}>Aprende sola (tocá para marcar):</span>
              <div className={styles.chips}>
                {(getPersona(step.result)?.skills ?? []).map((s) => {
                  const on = step.learn.some((l) => l.skill === s.skill);
                  return (
                    <button key={s.skill} type="button" className={`${styles.chip} ${on ? styles.chipLearn : styles.chipOff}`} onClick={() => onChange({ ...step, learn: on ? step.learn.filter((l) => l.skill !== s.skill) : [...step.learn, { skill: s.skill, level: s.level }] })}>
                      {s.level ? `Nv ${s.level}` : 'Base'} · {skillName(s.skill)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Slot>
      </div>

      {check === 'ok' && <p className={styles.ok}>✓ Combinación correcta en Royal</p>}
      {check === 'bad' && (
        <p className={styles.bad}>
          ✗ Esta combinación no da {pname(step.result)}.
          {real ? ` ${step.ingredients.map((x) => pname(x.persona)).join(' + ')} da ${pname(real)}.` : ''}
          {real && (
            <button type="button" className={styles.fix} onClick={() => onChange({ ...step, result: real, learn: [] })}>
              Usar {pname(real)}
            </button>
          )}
        </p>
      )}

      {previous.length > 0 && (
        <div className={styles.created}>
          <span className={styles.mini}>Usar una Persona que ya creaste:</span>
          <div className={styles.chips}>
            {previous.map((p) => (
              <button key={p.n} type="button" className={styles.createdBtn} onClick={() => useCreated(p.step.result)}>
                {personaImage(p.step.result, 'side') && <img src={personaImage(p.step.result, 'side')} alt="" style={{ objectPosition: personaCardFocus(p.step.result) }} />}
                Paso {p.n} · {pname(p.step.result)}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className={styles.field}>
        <span className="label label-accent">Explicación del paso</span>
        <textarea
          rows={3}
          maxLength={600}
          value={step.note ?? ''}
          onChange={(e) => onChange({ ...step, note: e.target.value || undefined })}
          placeholder="Contá con tus palabras qué hacer en este paso o qué hay que tener en cuenta. Ej.: «Ishtar ya trae Absorber viento de base: pasale solo Absorber hielo.»"
        />
      </label>

      <div className={styles.tools}>
        <button type="button" className={styles.smallBtn} onClick={() => onMove(-1)} disabled={index === 0}>← Mover antes</button>
        <button type="button" className={styles.smallBtn} onClick={() => onMove(1)} disabled={index === total - 1}>Mover después →</button>
        <button type="button" className={styles.smallBtn} onClick={onRemove}>Borrar paso</button>
        <button type="button" className="btn btn--light" onClick={onNext}>
          {isLastStep ? '+ Siguiente paso' : 'Ir al paso siguiente →'}
        </button>
      </div>

      {picking !== null && (
        <PersonaPicker
          title={picking === 'result' ? '¿Qué Persona querés crear?' : 'Elegí un ingrediente'}
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
      <button type="button" className={styles.slotPick} onClick={onPick} title={p ? 'Cambiar Persona' : 'Elegir Persona'}>
        {p ? (
          img ? <img src={img} alt="" style={{ objectPosition: personaCardFocus(personaId) }} /> : <span className={styles.slotEmpty}>Sin foto</span>
        ) : (
          <span className={styles.slotEmpty}>+ Elegir<br />{label.toLowerCase()}</span>
        )}
        {tag && <span className={styles.tag}>{tag}</span>}
        {req && <span className={styles.req}>{req.kind === 'story' ? 'Historia' : req.text}</span>}
      </button>
      <div className={styles.slotName}>
        {p ? (
          <>
            <Link to={`/p5r/calculadora/persona/${personaId}`} target="_blank" title="Ver perfil (se abre aparte)">{personaName(p)}</Link>
            <small>Nv {p.level}</small>
          </>
        ) : (
          <span className={styles.mini}>{label}</span>
        )}
        {onClear && (
          <button type="button" className={styles.clear} onClick={onClear} aria-label="Quitar ingrediente">×</button>
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
  const [text, setText] = useState('');
  const listId = useMemo(() => `sk-${Math.random().toString(36).slice(2)}`, []);
  const extra = value.filter((s) => !carried.includes(s) && !own.some((o) => o.skill === s));
  const toggle = (s: string) => {
    const on = value.includes(s);
    const next = on ? value.filter((x) => x !== s) : [...value, s].slice(0, MAX_SKILLS);
    // Nota automática con el nivel más alto que hace falta
    const lv = Math.max(0, ...next.map((k) => own.find((o) => o.skill === k)?.level ?? 0));
    const learnt = next.filter((k) => (own.find((o) => o.skill === k)?.level ?? 0) === lv && lv > 0);
    onChange(next, lv > (p?.level ?? 0) ? `Subila al Nv ${lv} para que aprenda ${learnt.map(skillName).join(' y ')}` : '');
  };
  const add = () => {
    const k = findSkill(text);
    if (k && !value.includes(k)) onChange([...value, k]);
    setText('');
  };
  return (
    <div className={styles.toggles}>
      {carried.length > 0 && <span className={styles.mini}>Trae heredadas:</span>}
      <div className={styles.chips}>
        {carried.map((s) => (
          <button key={`c-${s}`} type="button" className={`${styles.chip} ${value.includes(s) ? styles.chipOn : styles.chipOff}`} onClick={() => toggle(s)}>
            {skillName(s)}
          </button>
        ))}
      </div>
      <span className={styles.mini}>Sus habilidades:</span>
      <div className={styles.chips}>
        {own.filter((o) => !carried.includes(o.skill)).map((o) => (
          <button key={o.skill} type="button" className={`${styles.chip} ${value.includes(o.skill) ? styles.chipOn : styles.chipOff}`} onClick={() => toggle(o.skill)} title={o.level ? `La aprende al Nv ${o.level}` : 'La trae de base'}>
            {o.level ? <small>Nv {o.level}</small> : null} {skillName(o.skill)}
          </button>
        ))}
        {extra.map((s) => (
          <button key={`e-${s}`} type="button" className={`${styles.chip} ${styles.chipOn}`} onClick={() => toggle(s)}>
            {skillName(s)}
          </button>
        ))}
      </div>
      <div className={styles.addSkill}>
        <input list={listId} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="Otra habilidad…" />
        <button type="button" onClick={add}>+</button>
        <datalist id={listId}>{SKILLS.map((k) => <option key={k} value={skillName(k)} />)}</datalist>
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
          <button type="button" className={styles.clear} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <input autoFocus className={styles.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre…" />
        {createdSet.length > 0 && !q && (
          <>
            <span className={styles.mini}>Creadas en pasos anteriores</span>
            <div className={styles.grid}>{createdSet.map((id) => <PickCard key={`c-${id}`} id={id} onPick={onPick} />)}</div>
            <span className={styles.mini}>Todas</span>
          </>
        )}
        <div className={styles.grid}>
          {list.slice(0, 120).map((p) => <PickCard key={p.id} id={p.id} onPick={onPick} />)}
        </div>
        {list.length > 120 && <p className={styles.mini}>Escribí para encontrar más…</p>}
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
      <small>Nv {p.level}</small>
    </button>
  );
}

/* ---------- Skill cards ---------- */

function CardsPanel({ cards, onChange }: { cards: BuildCard[]; onChange: (c: BuildCard[]) => void }) {
  const [picking, setPicking] = useState<number | null>(null);
  return (
    <div className={styles.panel}>
      <h2 className={styles.h2}>Skill cards del toque final</h2>
      <p className={styles.howto}>Elegí la habilidad y la Persona que se lleva a la silla eléctrica para conseguir la carta.</p>
      {cards.map((c, k) => (
        <div key={k} className={styles.cardRow}>
          <Slot personaId={c.from} label="Persona para la silla" onPick={() => setPicking(k)} />
          <span className={styles.op}>➜</span>
          <div className={styles.field}>
            <span className={styles.mini}>Habilidad de la carta</span>
            <SkillInput value={c.skill} onChange={(skill) => onChange(cards.map((x, j) => (j === k ? { ...x, skill } : x)))} />
            <button type="button" className={styles.smallBtn} onClick={() => onChange(cards.filter((_, j) => j !== k))}>Quitar carta</button>
          </div>
        </div>
      ))}
      {cards.length < 8 && (
        <button type="button" className="btn btn--light" onClick={() => onChange([...cards, { skill: '', from: '' }])}>+ Agregar skill card</button>
      )}
      {picking !== null && (
        <PersonaPicker
          title="Persona para la silla eléctrica"
          created={[]}
          onPick={(from) => { onChange(cards.map((x, j) => (j === picking ? { ...x, from } : x))); setPicking(null); }}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}

function SkillInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value ? skillName(value) : '');
  const listId = useMemo(() => `ski-${Math.random().toString(36).slice(2)}`, []);
  return (
    <>
      <input list={listId} value={text} onChange={(e) => { setText(e.target.value); onChange(findSkill(e.target.value) ?? ''); }} placeholder="Escribí una habilidad" />
      <datalist id={listId}>{SKILLS.map((k) => <option key={k} value={skillName(k)} />)}</datalist>
    </>
  );
}
