import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
  type BuildLearn,
  type BuildStep,
} from '../../../core/account/builds';
import { authErrorText } from '../../../core/account/supabase';
import { BackButton } from '../../../shared/components/BackButton';
import { getAllPersonas, getAllSkills, getPersona } from '../services/personas';
import { bySkillName, skillName } from '../services/gameText';
import { checkStep, specialIngredients } from '../services/builds';
import { PersonaSelect } from '../components/PersonaSelect';
import { BuildRequirements, BuildTimeline } from '../components/BuildTimeline';
import styles from './Builds.module.css';

const ing = (persona = '', skills: string[] = []): BuildIngredient => ({ persona, skills });
const emptyStep = (): BuildStep => ({ ingredients: [ing(), ing()], result: '', inherit: [], learn: [] });

/** Crear o editar una build. */
export default function BuildEditor() {
  const { buildId } = useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<BuildStep[]>([emptyStep()]);
  const [cards, setCards] = useState<BuildCard[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);

  useEffect(() => {
    if (!buildId) return;
    getBuild(buildId).then((b) => {
      if (!b) return;
      setTitle(b.title);
      setDescription(b.description ?? '');
      setSteps(b.steps);
      setCards(b.skill_cards);
      setOwner(b.user_id);
    });
  }, [buildId]);

  if (loading) return <div className="container" style={{ paddingBlock: 80 }}>Cargando…</div>;
  if (!user) return <Navigate to="/p5r/cuenta" state={{ from: '/p5r/builds/nueva' }} replace />;
  if (buildId && owner && owner !== user.id) return <Navigate to={`/p5r/builds/${buildId}`} replace />;

  const setStep = (i: number, s: BuildStep) => setSteps((list) => list.map((x, j) => (j === i ? s : x)));
  const move = (i: number, d: -1 | 1) =>
    setSteps((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const validate = (): string => {
    if (title.trim().length < 3) return 'Ponele un título (mínimo 3 letras).';
    for (const [i, s] of steps.entries()) {
      const c = checkStep(s);
      if (c === 'incomplete') return `Completá las Personas del paso ${i + 1}.`;
      if (c === 'bad') return `La combinación del paso ${i + 1} no da esa Persona. Revisala con la calculadora.`;
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
    <section className={`container ${styles.editor}`}>
      <BackButton fallback={buildId ? `/p5r/builds/${buildId}` : '/p5r/builds'} />
      <h1 className={styles.viewTitle}>{buildId ? 'Editar build' : 'Nueva build'}</h1>
      <p className={styles.desc}>
        Cargá cada fusión en orden. En cada Persona marcá solo las habilidades <strong>importantes</strong> que pasa. La
        web comprueba sola que cada combinación sea correcta en Royal y detecta qué confidentes, DLC o avance de la
        historia hacen falta.
      </p>
      <form onSubmit={save} className={styles.form} noValidate>
        <label className={styles.field}>
          <span className="label label-accent">Título</span>
          <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Yoshitsune casi indestructible" />
        </label>
        <label className={styles.field}>
          <span className="label label-accent">Descripción (opcional)</span>
          <textarea value={description} maxLength={2000} rows={3} onChange={(e) => setDescription(e.target.value)} placeholder="Para qué sirve, nivel recomendado, consejos…" />
        </label>

        {steps.map((s, i) => (
          <StepEditor
            key={i}
            index={i}
            total={steps.length}
            step={s}
            prevResults={steps.slice(0, i).map((x) => x.result).filter(Boolean)}
            onChange={(n) => setStep(i, n)}
            onMove={(d) => move(i, d)}
            onRemove={steps.length > 1 ? () => setSteps(steps.filter((_, j) => j !== i)) : undefined}
          />
        ))}
        {steps.length < MAX_STEPS && (
          <button type="button" className="btn btn--light" onClick={() => setSteps([...steps, emptyStep()])}>
            + Agregar paso
          </button>
        )}

        <div className={styles.stepBox}>
          <span className="label label-accent">Skill cards del toque final (opcional)</span>
          <span className={styles.hint}>La habilidad y la Persona que se lleva a la silla eléctrica para conseguir la carta.</span>
          {cards.map((c, k) => (
            <div key={k} className={styles.cardRow}>
              <label className={styles.field}>
                <span className={styles.hint}>Habilidad</span>
                <SkillInput value={c.skill} onChange={(skill) => setCards(cards.map((x, j) => (j === k ? { ...x, skill } : x)))} />
              </label>
              <label className={styles.field}>
                <span className={styles.hint}>Persona para la silla eléctrica</span>
                <PersonaSelect id={`card${k}`} value={c.from} options={ALL_PERSONAS} placeholder="Elegí una Persona" onChange={(from) => setCards(cards.map((x, j) => (j === k ? { ...x, from } : x)))} />
              </label>
              <button type="button" className={styles.smallBtn} onClick={() => setCards(cards.filter((_, j) => j !== k))}>Quitar</button>
            </div>
          ))}
          {cards.length < 8 && (
            <button type="button" className={styles.smallBtn} onClick={() => setCards([...cards, { skill: '', from: '' }])}>+ Agregar skill card</button>
          )}
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <button type="button" className="btn btn--light" onClick={() => setPreview((v) => !v)}>
            {preview ? 'Ocultar vista previa' : 'Vista previa'}
          </button>
          <button type="submit" className="btn btn--accent" disabled={busy}>
            {buildId ? 'Guardar cambios' : 'Publicar build'}
          </button>
          <Link to={buildId ? `/p5r/builds/${buildId}` : '/p5r/builds'} className={styles.smallBtn}>Cancelar</Link>
        </div>
      </form>

      {preview && (
        <div className={styles.viewBody}>
          <BuildRequirements steps={steps} cards={cards.filter((c) => c.skill && c.from)} />
          <BuildTimeline steps={steps.filter((s) => checkStep(s) !== 'incomplete')} cards={cards.filter((c) => c.skill && c.from)} />
        </div>
      )}
    </section>
  );
}

const ALL_PERSONAS = getAllPersonas().filter((p) => !p.party);

interface StepProps {
  index: number;
  total: number;
  step: BuildStep;
  prevResults: string[];
  onChange: (s: BuildStep) => void;
  onMove: (d: -1 | 1) => void;
  onRemove?: () => void;
}

function StepEditor({ index, total, step, prevResults, onChange, onMove, onRemove }: StepProps) {
  const check = checkStep(step);
  const offer = offered(step);
  const setIng = (j: number, v: BuildIngredient) => {
    const ingredients = step.ingredients.map((x, k) => (k === j ? v : x));
    // Lo que hereda el resultado arranca con todo lo importante que pasan los ingredientes
    const prevOffer = offered(step);
    const nextOffer = [...new Set(ingredients.flatMap((x) => x.skills))];
    const inherit = [...step.inherit.filter((s) => nextOffer.includes(s)), ...nextOffer.filter((s) => !prevOffer.includes(s))];
    onChange({ ...step, ingredients, inherit });
  };
  const setResult = (result: string) => {
    const special = specialIngredients(result);
    // Fusión especial/avanzada: se completan solos los ingredientes fijos (conservando lo cargado)
    if (special && special.length > 2) {
      const byId = new Map(step.ingredients.map((x) => [x.persona, x]));
      onChange({ ...step, result, ingredients: special.map((id) => byId.get(id) ?? ing(id)) });
    } else onChange({ ...step, result });
  };

  return (
    <fieldset className={styles.stepBox}>
      <legend className={styles.stepLabel}>
        Paso {index + 1}{' '}
        {check === 'ok' && <span className={styles.okTag}>✓ Combinación verificada</span>}
        {check === 'bad' && <span className={styles.badTag}>✗ Esta combinación no da ese resultado</span>}
      </legend>

      <div className={styles.resultBox}>
        <label className={styles.field}>
          <span className="label">Resultado de la fusión</span>
          <PersonaSelect id={`r${index}`} value={step.result} options={ALL_PERSONAS} placeholder="Elegí la Persona que sale" onChange={setResult} />
          {specialIngredients(step.result) && <span className={styles.hint}>Fusión especial: los ingredientes se cargan solos.</span>}
        </label>
        <div className={styles.field}>
          <span className="label">Hereda (importantes)</span>
          {offer.length ? (
            <div className={styles.chips}>
              {offer.map((s) => {
                const on = step.inherit.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={styles.chipBtn}
                    style={on ? undefined : { opacity: 0.45, textDecoration: 'line-through' }}
                    onClick={() => onChange({ ...step, inherit: on ? step.inherit.filter((x) => x !== s) : [...step.inherit, s] })}
                    title={on ? 'Tocá para no heredarla' : 'Tocá para heredarla'}
                  >
                    {skillName(s)}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className={styles.hint}>Marcá habilidades en los ingredientes de abajo.</span>
          )}
        </div>
        <div className={styles.field}>
          <span className="label">Aprende al subir de nivel</span>
          <LearnEditor personaId={step.result} value={step.learn} onChange={(learn) => onChange({ ...step, learn })} />
        </div>
      </div>

      {step.ingredients.map((x, j) => (
        <div key={j} className={styles.ingRow}>
          <label className={styles.field}>
            <span className={styles.hint}>
              Ingrediente {j + 1}
              {prevResults.includes(x.persona) && ' · sale de un paso anterior'}
            </span>
            <PersonaSelect id={`i${index}-${j}`} value={x.persona} options={ALL_PERSONAS} placeholder="Elegí una Persona" onChange={(v) => setIng(j, { ...x, persona: v })} />
          </label>
          <div className={styles.field}>
            <span className={styles.hint}>Habilidades importantes que pasa</span>
            <SkillPicker value={x.skills} onChange={(skills) => setIng(j, { ...x, skills })} />
          </div>
          <label className={styles.field}>
            <span className={styles.hint}>Nota (opcional)</span>
            <input value={x.note ?? ''} maxLength={120} onChange={(e) => setIng(j, { ...x, note: e.target.value || undefined })} placeholder="Ej.: subila al Nv 64" />
          </label>
          {step.ingredients.length > 2 && (
            <button type="button" className={styles.smallBtn} onClick={() => onChange({ ...step, ingredients: step.ingredients.filter((_, k) => k !== j) })}>
              Quitar
            </button>
          )}
        </div>
      ))}

      <label className={styles.field}>
        <span className={styles.hint}>Nota del paso (opcional): confidente necesario, DLC, consejo…</span>
        <input value={step.note ?? ''} maxLength={300} onChange={(e) => onChange({ ...step, note: e.target.value || undefined })} placeholder="Ej.: necesitás el confidente de Juicio al máximo para fusionar a Satán" />
      </label>

      <div className={styles.stepTools}>
        {step.ingredients.length < 6 && (
          <button type="button" className={styles.smallBtn} onClick={() => onChange({ ...step, ingredients: [...step.ingredients, ing()] })}>
            + Ingrediente
          </button>
        )}
        <button type="button" className={styles.smallBtn} onClick={() => onMove(-1)} disabled={index === 0}>↑ Subir</button>
        <button type="button" className={styles.smallBtn} onClick={() => onMove(1)} disabled={index === total - 1}>↓ Bajar</button>
        {onRemove && <button type="button" className={styles.smallBtn} onClick={onRemove}>Quitar paso</button>}
      </div>
    </fieldset>
  );
}

/** Habilidades que el resultado aprende solo; propone las de su lista con el nivel. */
function LearnEditor({ personaId, value, onChange }: { personaId: string; value: BuildLearn[]; onChange: (v: BuildLearn[]) => void }) {
  const own = getPersona(personaId)?.skills ?? [];
  if (!own.length) return <span className={styles.hint}>Elegí primero el resultado.</span>;
  return (
    <div className={styles.chips}>
      {own.map((s) => {
        const on = value.some((v) => v.skill === s.skill);
        return (
          <button
            key={s.skill}
            type="button"
            className={styles.chipBtn}
            style={on ? { background: 'rgba(139,224,78,0.18)', color: 'var(--c-hp)', borderColor: 'var(--c-hp)' } : { opacity: 0.55 }}
            onClick={() => onChange(on ? value.filter((v) => v.skill !== s.skill) : [...value, { skill: s.skill, level: s.level }])}
          >
            {s.level ? `Nv ${s.level}` : 'Base'} · {skillName(s.skill)}
          </button>
        );
      })}
    </div>
  );
}

const SKILLS = getAllSkills()
  .map((s) => s.name)
  .sort(bySkillName);
const findSkill = (text: string) => {
  const t = text.trim().toLowerCase();
  return SKILLS.find((k) => skillName(k).toLowerCase() === t || k.toLowerCase() === t);
};

function SkillInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value ? skillName(value) : '');
  const listId = useMemo(() => `sk-${Math.random().toString(36).slice(2)}`, []);
  return (
    <>
      <input
        list={listId}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(findSkill(e.target.value) ?? '');
        }}
        placeholder="Escribí una habilidad"
      />
      <datalist id={listId}>
        {SKILLS.map((k) => (
          <option key={k} value={skillName(k)} />
        ))}
      </datalist>
    </>
  );
}

function SkillPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState('');
  const listId = useMemo(() => `skills-${Math.random().toString(36).slice(2)}`, []);
  const add = () => {
    const key = findSkill(text);
    if (!key || value.includes(key) || value.length >= MAX_SKILLS) return;
    onChange([...value, key]);
    setText('');
  };
  return (
    <div className={styles.picker}>
      {value.length > 0 && (
        <div className={styles.chips}>
          {value.map((k) => (
            <button key={k} type="button" className={styles.chipBtn} onClick={() => onChange(value.filter((x) => x !== k))} title="Quitar">
              {skillName(k)} ×
            </button>
          ))}
        </div>
      )}
      {value.length < MAX_SKILLS && (
        <div className={styles.pickerRow}>
          <input
            list={listId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Escribí una habilidad"
          />
          <button type="button" className={styles.smallBtn} onClick={add}>+</button>
          <datalist id={listId}>
            {SKILLS.map((k) => (
              <option key={k} value={skillName(k)} />
            ))}
          </datalist>
        </div>
      )}
    </div>
  );
}
