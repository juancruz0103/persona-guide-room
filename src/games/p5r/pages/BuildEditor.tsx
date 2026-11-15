import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/account/AuthContext';
import { MAX_SKILLS, MAX_STEPS, getBuild, inherited, saveBuild, type BuildPart, type BuildStep } from '../../../core/account/builds';
import { authErrorText } from '../../../core/account/supabase';
import { getAllSkills, getCatalogPersonas } from '../services/personas';
import { bySkillName, skillName } from '../services/gameText';
import { PersonaSelect } from '../components/PersonaSelect';
import { BuildPersona } from '../components/BuildPersona';
import styles from './Builds.module.css';

const emptyPart = (): BuildPart => ({ persona: '', skills: [] });
const emptyStep = (prev?: BuildStep): BuildStep => ({
  a: prev ? { persona: prev.result, skills: inherited(prev) } : emptyPart(),
  b: emptyPart(),
  result: '',
});

/** Crear o editar una build. */
export default function BuildEditor() {
  const { buildId } = useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<BuildStep[]>([emptyStep()]);
  const [cards, setCards] = useState<string[]>([]);
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

  const setStep = (i: number, s: BuildStep) =>
    setSteps((list) => {
      const next = list.map((x, j) => (j === i ? s : x));
      // El paso siguiente arranca con el resultado de este (si el usuario no lo cambió a otra Persona)
      if (next[i + 1] && (next[i + 1].a.persona === list[i].result || !next[i + 1].a.persona)) {
        next[i + 1] = { ...next[i + 1], a: { persona: s.result, skills: inherited(s) } };
      }
      return next;
    });

  const validate = (): string => {
    if (title.trim().length < 3) return 'Ponele un título (mínimo 3 letras).';
    for (const [i, s] of steps.entries()) {
      if (!s.a.persona || !s.b.persona || !s.result) return `Completá las tres Personas del paso ${i + 1}.`;
    }
    return '';
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    if (!profile?.username) return setError('Elegí un nombre de usuario en «Mi perfil» antes de publicar.');
    setBusy(true);
    const res = await saveBuild(user.id, {
      id: buildId,
      title: title.trim(),
      description: description.trim() || null,
      steps,
      skill_cards: cards,
    });
    setBusy(false);
    if (res.error) {
      return setError(res.error.includes('row-level') ? 'Tu cuenta no puede publicar builds.' : authErrorText(res.error));
    }
    navigate(`/p5r/builds/${res.id}`);
  };

  return (
    <section className={`container ${styles.editor}`}>
      <h1 className={styles.viewTitle}>{buildId ? 'Editar build' : 'Nueva build'}</h1>
      <form onSubmit={save} className={styles.form} noValidate>
        <label className={styles.field}>
          <span className="label label-accent">Título</span>
          <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Yoshitsune que absorbe todo" />
        </label>
        <label className={styles.field}>
          <span className="label label-accent">Descripción (opcional)</span>
          <textarea value={description} maxLength={2000} rows={3} onChange={(e) => setDescription(e.target.value)} placeholder="Para qué sirve, nivel recomendado, consejos…" />
        </label>

        {steps.map((s, i) => (
          <StepEditor
            key={i}
            index={i}
            step={s}
            onChange={(n) => setStep(i, n)}
            onRemove={steps.length > 1 ? () => setSteps(steps.filter((_, j) => j !== i)) : undefined}
          />
        ))}
        {steps.length < MAX_STEPS && (
          <button type="button" className="btn btn--light" onClick={() => setSteps([...steps, emptyStep(steps[steps.length - 1])])}>
            + Agregar paso
          </button>
        )}

        <div className={styles.stepBox}>
          <span className="label label-accent">Toque final · skill cards (opcional)</span>
          <SkillPicker value={cards} onChange={setCards} />
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
        <div className={styles.timeline}>
          {steps.map((s, i) =>
            s.a.persona && s.b.persona && s.result ? (
              <div key={i}>
                <p className={styles.stepLabel}>Paso {i + 1}</p>
                <div className={styles.step}>
                  <BuildPersona personaId={s.a.persona} skills={s.a.skills} />
                  <span className={styles.op}>+</span>
                  <BuildPersona personaId={s.b.persona} skills={s.b.skills} />
                  <span className={styles.op}>=</span>
                  <BuildPersona personaId={s.result} skills={inherited(s)} result />
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </section>
  );
}

function StepEditor({ index, step, onChange, onRemove }: { index: number; step: BuildStep; onChange: (s: BuildStep) => void; onRemove?: () => void }) {
  const personas = useMemo(() => getCatalogPersonas(), []);
  const part = (key: 'a' | 'b', p: BuildPart) => onChange({ ...step, [key]: p });
  return (
    <fieldset className={styles.stepBox}>
      <legend className={styles.stepLabel}>Paso {index + 1}</legend>
      <div className={styles.stepGrid}>
        {(['a', 'b'] as const).map((k, n) => (
          <div key={k} className={styles.partBox}>
            <span className="label">Persona {n === 0 ? 'A' : 'B'}</span>
            <PersonaSelect id={`s${index}${k}`} value={step[k].persona} options={personas} placeholder="Elegí una Persona" onChange={(v) => part(k, { ...step[k], persona: v })} />
            <span className={styles.hint}>Habilidades que pasa al resultado</span>
            <SkillPicker value={step[k].skills} onChange={(skills) => part(k, { ...step[k], skills })} />
          </div>
        ))}
        <div className={styles.partBox}>
          <span className="label">Resultado</span>
          <PersonaSelect id={`s${index}r`} value={step.result} options={personas} placeholder="Elegí una Persona" onChange={(v) => onChange({ ...step, result: v })} />
          <span className={styles.hint}>Hereda: {inherited(step).length ? inherited(step).map(skillName).join(', ') : '—'}</span>
          {inherited(step).length > MAX_SKILLS && <span className={styles.error}>Una Persona puede tener como máximo {MAX_SKILLS} habilidades.</span>}
        </div>
      </div>
      <label className={styles.field}>
        <span className={styles.hint}>Nota del paso (opcional)</span>
        <input value={step.note ?? ''} maxLength={200} onChange={(e) => onChange({ ...step, note: e.target.value || undefined })} placeholder="Ej.: subí a Persona A al nivel 62 para que aprenda la habilidad" />
      </label>
      {onRemove && (
        <button type="button" className={styles.smallBtn} onClick={onRemove}>
          Quitar paso
        </button>
      )}
    </fieldset>
  );
}

const SKILLS = getAllSkills()
  .filter((s) => s.element !== 'tra')
  .map((s) => s.name)
  .sort(bySkillName);

function SkillPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState('');
  const listId = useMemo(() => `skills-${Math.random().toString(36).slice(2)}`, []);
  const add = () => {
    const key = SKILLS.find((k) => skillName(k).toLowerCase() === text.trim().toLowerCase() || k.toLowerCase() === text.trim().toLowerCase());
    if (!key || value.includes(key) || value.length >= MAX_SKILLS) return;
    onChange([...value, key]);
    setText('');
  };
  return (
    <div className={styles.picker}>
      <div className={styles.chips}>
        {value.map((k) => (
          <button key={k} type="button" className={styles.chipBtn} onClick={() => onChange(value.filter((x) => x !== k))} title="Quitar">
            {skillName(k)} ×
          </button>
        ))}
      </div>
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
          <button type="button" className={styles.smallBtn} onClick={add}>Agregar</button>
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
